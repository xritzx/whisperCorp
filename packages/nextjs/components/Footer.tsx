import React from "react";
import { BuidlGuidlLogo } from "./assets/BuidlGuidlLogo";
import { HeartIcon } from "@heroicons/react/20/solid";
import { SwitchTheme } from "./SwitchTheme";

/**
 * Site footer
 */
export const Footer = () => {
  return (<div className="min-h-0 py-5 px-1 mb-11 lg:mb-0">
  <div>
    <div className="fixed flex justify-between items-center w-full z-10 p-4 bottom-0 left-0 pointer-events-none">
      <SwitchTheme className={`pointer-events-auto`} />
    </div>
  </div>
  <div className="w-full">
    <ul className="menu menu-horizontal w-full">
      <div className="flex justify-center items-center gap-2 text-sm w-full">
        <div className="text-center">
          <a href="https://github.com/xritzx/whisperCorp" target="_blank" rel="noreferrer" className="link">
            Github
          </a>
        </div>
        <span>·</span>
        <div className="flex justify-center items-center gap-2">
          <p className="m-0 text-center">
            Built with <HeartIcon className="inline-block h-4 w-4" /> at
          </p>
          <a
            className="flex justify-center items-center gap-1"
            href="https://github.com/scaffold-eth/se-2"
            target="_blank"
            rel="noreferrer"
          >
            <BuidlGuidlLogo className="w-3 h-5 pb-1" />
            <span className="link">whisperCorp-2</span>
          </a>
        </div>
        <span>·</span>
        <div className="text-center">
          <a href="https://t.me/joinchat/KByvmRe5wkR-8F_zz6AjpA" target="_blank" rel="noreferrer" className="link">
            Support
          </a>
        </div>
      </div>
    </ul>
  </div>
</div>)
};
