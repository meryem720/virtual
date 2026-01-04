/**
 * Types NextAuth étendus
 */

import { RoleType } from '@prisma/client';
import 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      roles: RoleType[];
      studentProfileId?: string;
      parentProfileId?: string;
    };
  }

  interface User {
    id: string;
    email: string;
    name?: string | null;
    image?: string | null;
    roles: RoleType[];
    studentProfileId?: string;
    parentProfileId?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    roles: RoleType[];
    studentProfileId?: string;
    parentProfileId?: string;
  }
}
