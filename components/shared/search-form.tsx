"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type SearchFormProps = {
  defaultValue?: string;
  className?: string;
  // Dipanggil setelah pencarian dikirim, misalnya untuk menutup sheet menu
  onSearch?: () => void;
};

const SearchForm = ({
  defaultValue = "",
  className,
  onSearch,
}: SearchFormProps) => {
  const router = useRouter();
  const [value, setValue] = useState(defaultValue);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const query = value.trim();
    if (!query) return;

    router.push(`/search?q=${encodeURIComponent(query)}`);
    onSearch?.();
  }

  return (
    <form
      action="/search"
      role="search"
      onSubmit={handleSubmit}
      className={cn("relative", className)}
    >
      <Input
        name="q"
        type="search"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Cari produk…"
        aria-label="Cari produk"
        enterKeyHint="search"
        maxLength={100}
        className="pr-10 [&::-webkit-search-cancel-button]:appearance-none"
      />
      <Button
        type="submit"
        variant="ghost"
        size="icon"
        aria-label="Cari"
        className="absolute inset-y-0 right-0.5 my-auto size-8"
      >
        <Search className="size-4" />
      </Button>
    </form>
  );
};

export default SearchForm;
