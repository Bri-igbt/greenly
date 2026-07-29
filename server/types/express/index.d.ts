import "express-serve-static-core";
import { DeliveryPartner } from "../../generated/prisma/client";

declare module "express-serve-static-core" {
  interface Request {
    user?: {
      id: string;
      isAdmin?: boolean;
    };

    partner?: DeliveryPartner;
  }
}

export {};