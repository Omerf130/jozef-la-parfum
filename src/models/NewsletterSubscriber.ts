import mongoose, { Schema, model, models, type Model } from "mongoose";

export interface NewsletterSubscriberDoc {
  _id: mongoose.Types.ObjectId;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

const NewsletterSubscriberSchema = new Schema<NewsletterSubscriberDoc>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
  },
  { timestamps: true },
);

export const NewsletterSubscriberModel: Model<NewsletterSubscriberDoc> =
  (models.NewsletterSubscriber as Model<NewsletterSubscriberDoc>) ||
  model<NewsletterSubscriberDoc>("NewsletterSubscriber", NewsletterSubscriberSchema);
