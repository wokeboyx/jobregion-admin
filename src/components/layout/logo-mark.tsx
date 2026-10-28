import logo from "@/assets/logo.svg"

/** The Jobs Region wordmark, the same file the web app uses. */
function LogoMark({ className }: { className?: string }) {
  return <img src={logo} alt="Jobs Region" className={className} />
}

export { LogoMark }
