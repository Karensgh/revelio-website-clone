import { framerBody } from "@/site/generated/framer-body";
import SiteRuntime from "./site-runtime";

export default function Home() {
  return (
    <>
      <div id="site" style={{ display: "contents" }} dangerouslySetInnerHTML={{ __html: framerBody }} />
      <SiteRuntime />
    </>
  );
}
