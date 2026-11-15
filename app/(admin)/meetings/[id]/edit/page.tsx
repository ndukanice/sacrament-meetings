type EditMeetingPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditMeetingPage({ params }: EditMeetingPageProps) {
  const { id } = await params;

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="text-3xl font-bold text-slate-900">Edit Meeting #{id} — Coming in Week 04</h1>
      <p className="mt-3 text-slate-600">
        This form will let leaders update an existing meeting program.
      </p>
    </section>
  );
}
