import { IsString, IsNotEmpty, IsEnum, IsObject, IsNumber, IsDate, IsOptional } from 'class-validator';
import type { FieldValue } from 'firebase-admin/firestore';

export type PostStatus = 'draft' | 'published' | 'archived';
export type CategoryType = 'writing' | 'poem' | 'article';

export class Post {
  @IsString()
  @IsNotEmpty()
  id!: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  searchableTitle: string;

  @IsNumber()
  views: number = 0;

  @IsNumber()
  shareCount: number = 0;

  @IsNumber()
  likes: number = 0;

  @IsString({ each: true })
  @IsOptional()
  likedBy: string[] = [];

  @IsNumber()
  totalViewDuration: number = 0; // saniye cinsinden

  @IsDate()
  @IsOptional()
  lastViewedAt?: Date;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsEnum(['writing', 'poem', 'article'])
  category: CategoryType;

  @IsString()
  @IsNotEmpty()
  excerpt: string;

  @IsObject()
  image: {
    url: string;
    alt: string;
    publicId?: string;  // Cloudinary public_id için
  };

  @IsEnum(['draft', 'published', 'archived'])
  status: PostStatus;

  @IsString()
  @IsNotEmpty()
  author: string;

  @IsString()
  @IsNotEmpty()
  slug: string;

  @IsString()
  @IsNotEmpty()
  date: string;

  createdAt!: FieldValue;
  updatedAt!: FieldValue;

  constructor(
    title: string,
    content: string,
    category: CategoryType,
    excerpt: string,
    author: string,
    status: PostStatus = 'draft',
    image: { url: string; alt: string } = { url: '', alt: '' },
    date?: string
  ) {
    this.title = title;
    this.searchableTitle = title.toLowerCase();
    this.content = content;
    this.category = category;
    this.excerpt = excerpt;
    this.image = image;
    this.status = status;
    this.author = author;
    this.slug = this.createSlug(title);
    this.date = date || new Date().toISOString();
    this.views = 0;
    this.shareCount = 0;
    this.likes = 0;
    this.likedBy = [];
    this.totalViewDuration = 0;
  }

  public createSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ı/g, 'i')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  updateTitle(newTitle: string) {
    this.title = newTitle;
    this.searchableTitle = newTitle.toLowerCase();
    this.slug = this.createSlug(newTitle);
  }
}
