import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PageType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PagesService } from '../pages/pages.service';
import { CreateCateringOfferInput } from './dto/create-catering-offer.input';
import { UpdateCateringOfferInput } from './dto/update-catering-offer.input';

// Every offer we return carries its page (for the "by <page>" line) and its
// photos in upload order.
const offerInclude = {
  page: { include: { owner: true } },
  images: { orderBy: { order: 'asc' } },
} as const;

@Injectable()
export class CateringService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pages: PagesService,
  ) {}

  /**
   * Publish an offer under one of `authorId`'s pages. The page must be a
   * CATERING page — other vendor types have their own portfolio flows.
   */
  async create(authorId: string, input: CreateCateringOfferInput) {
    const page = await this.pages.assertOwned(authorId, input.pageId);
    if (!page.types.includes(PageType.CATERING)) {
      throw new BadRequestException(
        'Only catering pages can publish menu offers',
      );
    }
    return this.prisma.cateringOffer.create({
      data: {
        pageId: page.id,
        title: input.title.trim(),
        kind: input.kind.trim(),
        description: input.description?.trim() || null,
        pricePerPerson: input.pricePerPerson ?? null,
        images: {
          create: input.imageUrls.map((url, order) => ({
            url: url.trim(),
            order,
          })),
        },
      },
      include: offerInclude,
    });
  }

  /** Update an offer — only the owner of its page may. */
  async update(authorId: string, input: UpdateCateringOfferInput) {
    const offer = await this.prisma.cateringOffer.findUnique({
      where: { id: input.offerId },
      include: { page: true },
    });
    if (!offer) {
      throw new NotFoundException('Offer not found');
    }
    if (offer.page.ownerId !== authorId) {
      throw new ForbiddenException(
        'You can only edit offers on your own pages',
      );
    }
    return this.prisma.cateringOffer.update({
      where: { id: offer.id },
      data: {
        title: input.title?.trim(),
        kind: input.kind?.trim(),
        description:
          input.description === undefined
            ? undefined
            : input.description.trim() || null,
        // -1 is the "clear the price" sentinel.
        pricePerPerson:
          input.pricePerPerson === undefined
            ? undefined
            : input.pricePerPerson < 0
              ? null
              : input.pricePerPerson,
        images: input.imageUrls
          ? {
              deleteMany: {},
              create: input.imageUrls.map((url, order) => ({
                url: url.trim(),
                order,
              })),
            }
          : undefined,
      },
      include: offerInclude,
    });
  }

  /** Delete an offer — only the owner of its page may. */
  async delete(authorId: string, offerId: string): Promise<boolean> {
    const offer = await this.prisma.cateringOffer.findUnique({
      where: { id: offerId },
      include: { page: true },
    });
    if (!offer) {
      throw new NotFoundException('Offer not found');
    }
    if (offer.page.ownerId !== authorId) {
      throw new ForbiddenException(
        'You can only delete offers on your own pages',
      );
    }
    await this.prisma.cateringOffer.delete({ where: { id: offerId } });
    return true;
  }

  /** A single page's offers, newest first. */
  listByPageId(pageId: string) {
    return this.prisma.cateringOffer.findMany({
      where: { pageId },
      include: offerInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  /** Browse offers across all pages, newest first, optionally by kind. */
  list(kind?: string | null, limit = 50) {
    return this.prisma.cateringOffer.findMany({
      where: kind ? { kind } : undefined,
      include: offerInclude,
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}
