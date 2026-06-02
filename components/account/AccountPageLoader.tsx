export default function AccountPageLoader() {
  return (
    <div className="min-h-screen bg-[#F4F6F8] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div
          className="h-12 w-12 animate-spin rounded-full border-4 border-[#E36630] border-t-transparent"
          role="status"
          aria-label="Loading"
        />
        <p className="text-sm text-gray-500">Loading your account…</p>
      </div>
    </div>
  );
}
