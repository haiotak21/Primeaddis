import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface IHeroSlide {
  image: string;
  title: string;
  subtitle?: string;
  link?: string;
}

export interface IHero extends Document {
  slides: IHeroSlide[];
  createdAt: Date;
  updatedAt: Date;
}

const SlideSchema = new Schema<IHeroSlide>(
  {
    image: { type: String, required: true },
    title: { type: String, required: true },
    subtitle: { type: String, default: "" },
    link: { type: String, default: "" },
  },
  { _id: false }
);

const HeroSchema = new Schema<IHero>(
  {
    slides: { type: [SlideSchema], default: [] },
  },
  { timestamps: true }
);

const Hero: Model<IHero> =
  mongoose.models.Hero || mongoose.model<IHero>("Hero", HeroSchema);

export default Hero;
