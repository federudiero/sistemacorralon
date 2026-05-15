import { useEffect, useMemo, useState } from 'react';

const DEFAULT_PAGE_SIZE = 10;

export default function useClientPagination(items = [], options = {}) {
  const { pageSize = DEFAULT_PAGE_SIZE, enabled = true } = options;
  const safeItems = Array.isArray(items) ? items : [];
  const safePageSize = Math.max(1, Number(pageSize) || DEFAULT_PAGE_SIZE);
  const [page, setPage] = useState(1);

  const totalItems = safeItems.length;
  const shouldPaginate = Boolean(enabled) && totalItems > safePageSize;
  const totalPages = shouldPaginate ? Math.ceil(totalItems / safePageSize) : 1;

  useEffect(() => {
    setPage(1);
  }, [totalItems, safePageSize]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages || 1);
    }
  }, [page, totalPages]);

  const currentPage = Math.min(Math.max(page, 1), totalPages || 1);
  const startIndex = shouldPaginate ? (currentPage - 1) * safePageSize : 0;
  const endIndex = shouldPaginate ? startIndex + safePageSize : totalItems;

  const paginatedItems = useMemo(() => {
    if (!shouldPaginate) return safeItems;
    return safeItems.slice(startIndex, endIndex);
  }, [safeItems, shouldPaginate, startIndex, endIndex]);

  return {
    page: currentPage,
    setPage,
    pageSize: safePageSize,
    totalItems,
    totalPages,
    shouldPaginate,
    paginatedItems,
    startItem: totalItems ? startIndex + 1 : 0,
    endItem: Math.min(endIndex, totalItems),
  };
}
