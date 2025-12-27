import { ReactNode, useState } from "react";
import { useTranslation } from "react-i18next";

export type DiagramRendererProps = {
  content: string;
  children: ReactNode;
};

export default function DiagramRenderer({
  content,
  children,
}: DiagramRendererProps) {
  const { t } = useTranslation("commons", { keyPrefix: "md.diagram" });
  const [isCodeView, setIsCodeView] = useState(false);

  const toggleView = () => {
    setIsCodeView(!isCodeView);
  };

  return (
    <div className="mermaid-container">
      <div style={{ padding: "8px", textAlign: "right" }}>
        <button onClick={toggleView}>
          {isCodeView ? t("view-diagram") : t("view-code")}
        </button>
      </div>
      {isCodeView ? (
        <pre>
          <code>{content}</code>
        </pre>
      ) : (
        children
      )}
    </div>
  );
}
