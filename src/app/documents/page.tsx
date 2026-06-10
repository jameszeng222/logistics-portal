import { redirect } from "next/server"

export default function DocumentsPage() {
  redirect("/documents/generate")
}
