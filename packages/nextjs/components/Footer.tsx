import React from "react";
import { BuidlGuidlLogo } from "./assets/BuidlGuidlLogo";
import { HeartIcon } from "@heroicons/react/20/solid";

/**
 * Site footer
 */
export const Footer = () => {
  return (<div className="min-h-0 py-5 px-1 mb-11 lg:mb-0">

  <div className="w-full">
    <ul className="menu menu-horizontal w-full">
      <div className="flex justify-center items-center gap-2 text-sm w-full">
        <div className="text-center">
          <a href="https://github.com/xritzx/whisperCorp" target="_blank" rel="noreferrer" className="link">
          WhisperCorp
          </a>
        </div>
        <span>·</span>
        <div className="flex justify-center items-center gap-2">
          <p className="m-0 text-center">
            is Built with <HeartIcon className="inline-block h-4 w-4" /> with
          </p>
          <a
            className="flex justify-center items-center gap-1"
            href="https://github.com/scaffold-eth/se-2"
            target="_blank"
            rel="noreferrer"
          >
            <BuidlGuidlLogo className="w-3 h-5 pb-1" />
            <span className="link">scaffold-eth-2</span>
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
