import Spline from '@splinetool/react-spline'

export default function Hero() {
  return (
    <section className="relative w-full overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <Spline scene="https://prod.spline.design/zhZFnwyOYLgqlLWk/scene.splinecode" />
      </div>
      <div className="relative mx-auto max-w-6xl px-6 pt-24 pb-16 sm:pt-28 sm:pb-24">
        <div className="backdrop-blur-sm bg-white/30 rounded-2xl border border-white/40 shadow-2xl p-6 sm:p-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight text-slate-800">
                Tool Lifecycle Simulator
              </h1>
              <p className="mt-3 text-slate-700 max-w-2xl">
                A realistic, clickable prototype showing how requesters and admins progress through stages, upload documents, assign reviewers, and track every action in a live activity log.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 px-3 py-1 text-sm border border-emerald-100 shadow-sm">
                Live • Interactive
              </span>
              <span className="hidden sm:inline-flex items-center rounded-full bg-slate-900 text-white px-3 py-1 text-sm shadow">
                Admin/User Toggle Below
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
