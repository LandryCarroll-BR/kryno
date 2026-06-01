import { redirect } from "react-router"

import { gymUserLogoutAction } from "../../features/auth/gym-user-logout/gym-user-logout-action"

export const action = gymUserLogoutAction

export const loader = () => redirect("/login")
