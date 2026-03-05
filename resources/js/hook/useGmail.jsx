/**
 * useGmail.js
 * Custom hooks untuk fetch data Gmail dari Laravel API
 */

import { useState, useEffect, useCallback, useRef } from "react";
import {
  fetchSalesList,
  fetchInbox,
  fetchSent,
  fetchMessageDetail,
  normalizeMessage,
} from "./gmailApi";

// ── useSales ──────────────────────────────────────────────────────────────────
/**
 * Fetch daftar sales dari GET /api/sales
 * Returns: { sales, loading, error, refetch }
 *
 * Shape per sales dari API: { id, name, email }
 * Hook menambahkan `avatar` (huruf pertama nama) dan
 * `gmailAccountId` (default sama dengan id, override jika beda).
 */
export function useSales() {
  const [sales,   setSales]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchSalesList();
      // Normalisasi: tambah avatar & gmailAccountId
      setSales(
        data.map((s) => ({
          ...s,
          avatar         : s.name?.charAt(0).toUpperCase() ?? "?",
          gmailAccountId : s.gmail_account_id ?? s.id,  // sesuaikan dengan kolom di DB
        }))
      );
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return { sales, loading, error, refetch: load };
}

// ── useInbox ──────────────────────────────────────────────────────────────────
export function useInbox(accountId, salesId) {
  const [state, setState] = useState({
    emails       : [],
    loading      : false,
    loadingMore  : false,
    error        : null,
    nextPageToken: null,
  });

  const activeAccount = useRef(accountId);
  useEffect(() => { activeAccount.current = accountId; }, [accountId]);

  const doFetch = useCallback(async (acctId, salesId, pageToken, append) => {
    if (!acctId) return;
    setState(prev => pageToken
      ? { ...prev, loadingMore: true, error: null }
      : { ...prev, loading: true, error: null }
    );
    try {
      const data = await fetchInbox(acctId, pageToken);
      if (activeAccount.current !== acctId) return;
      const normalized = (data.emails ?? []).map(m => ({ ...m, salesId }));
      setState(prev => ({
        ...prev,
        emails       : append ? [...prev.emails, ...normalized] : normalized,
        nextPageToken: data.next_page_token ?? null,
        loading      : false,
        loadingMore  : false,
      }));
    } catch (e) {
      if (activeAccount.current !== acctId) return;
      setState(prev => ({ ...prev, error: e.message, loading: false, loadingMore: false }));
    }
  }, []);

  useEffect(() => {
    if (!accountId) return;
    setState({ emails: [], loading: true, loadingMore: false, error: null, nextPageToken: null });
    doFetch(accountId, salesId, null, false);
  }, [accountId, salesId]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadMore = useCallback(() => {
    if (state.nextPageToken) doFetch(accountId, salesId, state.nextPageToken, true);
  }, [state.nextPageToken, accountId, salesId, doFetch]);

  return {
    emails       : state.emails,
    loading      : state.loading,
    loadingMore  : state.loadingMore,
    error        : state.error,
    nextPageToken: state.nextPageToken,
    loadMore,
    refetch      : () => {
      setState(prev => ({ ...prev, loading: true, error: null }));
      doFetch(accountId, salesId, null, false);
    },
  };
}

// ── useSent ───────────────────────────────────────────────────────────────────
/**
 * Fetch sent untuk satu sales account.
 * Menggunakan useRef untuk menyimpan state agar tidak kehilangan nextPageToken.
 */
export function useSent(accountId, salesId) {
  const [state, setState] = useState({
    emails       : [],
    loading      : false,
    loadingMore  : false,
    error        : null,
    nextPageToken: null,
  });

  // Simpan accountId aktif di ref agar async fetch tahu apakah masih relevan
  const activeAccount = useRef(accountId);
  useEffect(() => { activeAccount.current = accountId; }, [accountId]);

  const doFetch = useCallback(async (acctId, salesId, pageToken, append) => {
    if (!acctId) return;
    setState(prev => pageToken
      ? { ...prev, loadingMore: true, error: null }
      : { ...prev, loading: true, error: null }
    );
    try {
      const data = await fetchSent(acctId, pageToken);
      // Abaikan hasil jika account sudah berganti
      if (activeAccount.current !== acctId) return;
      const normalized = (data.emails ?? []).map(m => ({ ...m, salesId }));
      setState(prev => ({
        ...prev,
        emails       : append ? [...prev.emails, ...normalized] : normalized,
        nextPageToken: data.next_page_token ?? null,
        loading      : false,
        loadingMore  : false,
      }));
    } catch (e) {
      if (activeAccount.current !== acctId) return;
      setState(prev => ({ ...prev, error: e.message, loading: false, loadingMore: false }));
    }
  }, []);

  // Reset + fetch saat account berganti
  useEffect(() => {
    if (!accountId) return;
    setState({ emails: [], loading: true, loadingMore: false, error: null, nextPageToken: null });
    doFetch(accountId, salesId, null, false);
  }, [accountId, salesId]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadMore = useCallback(() => {
    if (state.nextPageToken) doFetch(accountId, salesId, state.nextPageToken, true);
  }, [state.nextPageToken, accountId, salesId, doFetch]);

  return {
    emails       : state.emails,
    loading      : state.loading,
    loadingMore  : state.loadingMore,
    error        : state.error,
    nextPageToken: state.nextPageToken,
    loadMore,
    refetch      : () => {
      setState(prev => ({ ...prev, loading: true, error: null }));
      doFetch(accountId, salesId, null, false);
    },
  };
}

// ── useMessageDetail ──────────────────────────────────────────────────────────
/**
 * Fetch detail satu pesan (format "full"), lengkap dengan body HTML.
 * @param {string|number|null} accountId
 * @param {string|null}        messageId
 * @param {string|number|null} salesId
 */
export function useMessageDetail(accountId, messageId, salesId) {
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  // Cache sederhana agar tidak re-fetch pesan yang sama
  const cache = useRef({});

  const load = useCallback(async () => {
    if (!accountId || !messageId) return;
    const key = `${accountId}-${messageId}`;

    // Pakai cache jika ada
    if (cache.current[key]) {
      setMessage(cache.current[key]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const raw = await fetchMessageDetail(accountId, messageId);
      const msg = normalizeMessage(raw, salesId);
      cache.current[key] = msg;
      setMessage(msg);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [accountId, messageId, salesId]);

  useEffect(() => { load(); }, [load]);

  return { message, loading, error, refetch: load };
}