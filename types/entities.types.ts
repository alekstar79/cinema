export type OID = string;

export interface BaseEntity {
  oid: OID;
}

export interface Genre extends BaseEntity {
  name: string;
}

export interface Label extends BaseEntity {
  name: string;
}

export interface Asset {
  oid: OID;
  asset_type: 'Poster' | 'Banner' | 'Screenshot';
  resize_url: string;
}

export interface ContentItem extends BaseEntity {
  title: string;
  synopsis: string;
  age: number;
  /** After resolving, OID strings may be replaced by full `Genre` objects. */
  genres: OID[] | Genre[];
  labels: OID[] | Label[];
  assets: Asset[];
  url: string;
  air_year?: number;
  end_year?: number;
}

export interface Slide extends BaseEntity {
  title: ContentItem;
  trailer?: any;
  preview?: any;
  live_banners?: any;
}

export interface Collection extends BaseEntity {
  name: string;
  kind: 'horizontal' | 'vertical';
  new_window: boolean;
  slug: string;
}

export interface Showcase extends BaseEntity {
  name: string;
  slides: Slide[];
  collections: Collection[];
}
