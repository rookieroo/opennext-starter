import { Button } from "@repo/ui/components/ui/button"
import Link from "next/link";
import { useConfigStore } from "@/state/config";
import Google from "@/icons/google";
import { SiNotion } from "@icons-pack/react-simple-icons";

export default function SSOButtons({
  isSignIn = false
}: {
  isSignIn?: boolean
}) {
  const { isGoogleSSOEnabled, isNotionSSOEnabled } = useConfigStore()

  return (
    <>
      {isGoogleSSOEnabled && (
        <>
          <Button className="w-full" asChild>
            <Link href="/sso/google">
              <Google className="w-[22px] h-[22px] mr-1" />
              {isSignIn ? "Sign in with Google" : "Sign up with Google"}
            </Link>
          </Button>
        </>
      )}
      {isNotionSSOEnabled && (
        <>
          <Button className="w-full" asChild>
            <Link href="/sso/notion">
              <SiNotion className="w-[22px] h-[22px] mr-1" />
              {isSignIn ? "Sign in with Notion" : "Sign up with Notion"}
            </Link>
          </Button>
        </>
      )}
    </>
  )
}
