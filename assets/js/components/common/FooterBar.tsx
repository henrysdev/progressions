import * as React from "react";
import { MidiMatchesLogoSvg } from "./MidiMatchesLogoSvg";
import { MaterialIcon } from ".";

interface FooterBarProps {
  playerAlias?: string;
}

const FooterBar: React.FC<FooterBarProps> = ({ playerAlias }) => {
  return (
    <div className="footer_bar">
      <div className="footer_bar_flex_wrapper">
        <a
          className="footer_bar_flex_item resource_link"
          href="https://github.com/henrysdev/midimatches"
        >
          GitHub
        </a>
        <span className="accent_bars">/</span>
        <a
          className="footer_bar_flex_item resource_link"
          href="https://discord.gg/CjKD7G3C"
        >
          Discord
        </a>
        <span className="accent_bars">/</span>
        <a
          className="footer_bar_flex_item resource_link"
          href="https://www.patreon.com/midimatches"
        >
          Patreon
        </a>
        <span className="accent_bars">/</span>
        <a
          className="footer_bar_flex_item resource_link"
          href="https://twitter.com/midimatches"
        >
          Twitter
        </a>
        <span className="accent_bars">/</span>
        <a
          className="footer_bar_flex_item resource_link"
          href="mailto:henrysdev@gmail.com"
        >
          Contact
        </a>
      </div>
    </div>
  );
};

export { FooterBar };