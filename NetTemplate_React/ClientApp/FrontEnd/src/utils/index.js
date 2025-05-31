import { useEffect } from "react";
import { useLocation } from "react-router";

export const ScrollToTop = ({ scrollRef }) => {
  const { pathname } = useLocation();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [pathname, scrollRef]);

  return null;
}

export const parseUserAgent = (userAgentString) => {
    // Extract browser name and version
    let browser = "Unknown";
    const chromeMatch = userAgentString.match(/Chrome\/(\d+\.\d+\.\d+\.\d+)/);
    const firefoxMatch = userAgentString.match(/Firefox\/(\d+\.\d+)/);
    const safariMatch = userAgentString.match(/Version\/(\d+\.\d+\.\d+).*Safari/);
    const edgeMatch = userAgentString.match(/Edg\/(\d+\.\d+\.\d+\.\d+)/);
    
    if (chromeMatch && !edgeMatch) {
        browser = `Chrome ${chromeMatch[1]}`;
    } else if (firefoxMatch) {
        browser = `Firefox ${firefoxMatch[1]}`;
    } else if (safariMatch) {
        browser = `Safari ${safariMatch[1]}`;
    } else if (edgeMatch) {
        browser = `Edge ${edgeMatch[1]}`;
    }
    
    // Extract operating system
    let os = "Unknown";
    if (userAgentString.includes("Windows NT 10.0")) {
        os = "Windows 10";
    } else if (userAgentString.includes("Windows NT 6.3")) {
        os = "Windows 8.1";
    } else if (userAgentString.includes("Windows NT 6.1")) {
        os = "Windows 7";
    } else if (userAgentString.includes("Mac OS X")) {
        const macMatch = userAgentString.match(/Mac OS X (\d+_\d+_\d+)/);
        if (macMatch) {
            os = `macOS ${macMatch[1].replace(/_/g, '.')}`;
        } else {
            os = "macOS";
        }
    } else if (userAgentString.includes("Linux")) {
        os = "Linux";
    }
    
    // Create simplified user agent (remove browser-specific parts)
    const simplifiedUA = userAgentString.split(') ')[0] + ')';
    
    return {
        "Browser": browser,
        "Operating System": os,
        "User Agent": simplifiedUA
    };
}
