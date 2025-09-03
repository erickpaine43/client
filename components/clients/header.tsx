import { copyText as t } from "./data/copy";

export function Header() {
  return (
    <div className="flex items-center justify-between">
      <h1 className="text-2xl font-bold">{t.page.title}</h1>
    </div>
  );
}
