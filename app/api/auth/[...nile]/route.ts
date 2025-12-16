import { Handlers } from "@niledatabase/nextjs";
import { nile } from "@/app/api/[...nile]/nile";

export const { POST, GET, DELETE, PUT } = nile.handlers as Handlers;
