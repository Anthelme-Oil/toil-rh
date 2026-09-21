//app/api/users/route.ts

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getAllUsers,  updateUserRole,
} from '@/lib/users/service';
import { ROLE_ACTIONS, type RoleAction } from '@/lib/users/types';

export async function GET() {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json(
      { error: 'Non authentifié' },
      { status: 401 }
    );
  }
// console.log(session,"session")
  if (
    session.user.role !== 'ADMIN' &&
    !session.user.isDRH
  ) {
    return NextResponse.json(
      { error: 'Accès interdit' },
      { status: 403 }
    );
  }

  try {
    const users = await getAllUsers();

    // console.log("utilisateurs=>",users)

    return NextResponse.json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error('Erreur récupération utilisateurs:', error);

    return NextResponse.json(
      { error: 'Erreur lors de la récupération des utilisateurs' },
      { status: 500 }
    );
  }
}






// export async function GET() {
//   try {
//     const users = await getAllUsers();

//     return NextResponse.json(users);
//   } catch (error) {
//     console.error('Erreur lors de la récupération des utilisateurs:', error);

//     return NextResponse.json(
//       {
//         error: 'Impossible de récupérer les utilisateurs.',
//       },
//       { status: 500 }
//     );
//   }
// }

export async function PATCH(request: Request) {
  try {
    const body = await request.json();

    const userId = body.userId;
    const action = body.action as RoleAction;

    if (!userId) {
      return NextResponse.json(
        {
          error: "L'identifiant de l'utilisateur est requis.",
        },
        { status: 400 }
      );
    }

    if (!ROLE_ACTIONS.includes(action)) {
      return NextResponse.json(
        {
          error: 'Action de rôle invalide.',
        },
        { status: 400 }
      );
    }

    await updateUserRole(userId, action);

    return NextResponse.json({
      success: true,
      message: 'Rôle de l’utilisateur mis à jour.',
    });
  } catch (error) {
    console.error(
      'Erreur lors de la mise à jour du rôle:',
      error
    );

    return NextResponse.json(
      {
        error: 'Impossible de mettre à jour le rôle de l’utilisateur.',
      },
      { status: 500 }
    );
  }
}