/*
 * Real photos, copied from the web app's public/images, so the admin looks like the product it manages:
 * people get faces, jobs get covers. Businesses keep initials, like company accounts in the app.
 */

const img = (path: string) => `${import.meta.env.BASE_URL}images/${path}`

/** Profile photos by person name (users and admins). */
const PHOTO_BY_NAME: Record<string, string> = {
  "Ngozi Adeyemi": img("people/chidinma.png"),
  "Grace Effiong": img("people/anita.jpg"),
  "Femi Ojo": img("people/emeka.png"),
  "Ifeanyi Chukwu": img("people/musa.png"),
  "Bassey Umoh": img("people/3.png"),
  "Uche Eze": img("people/ademola.jpg"),
  "Kwame Asante": img("people/kyc.png"),
  "Tolu Bankole": img("people/temitope.png"),
  "Aisha Bello": img("people/5.png"),
  "Desmond Ajimuda": img("people/2.png"),
  "Chiamaka Obi": img("people/4.png"),
  "Tunde Bakare": img("people/wale.jpg"),
  "Grace Nwankwo": img("people/bimbo.png"),
}

export function photoFor(name: string): string | undefined {
  return PHOTO_BY_NAME[name]
}

/** Job cover photos by job id: the job's own photo, as on the web app's photo-first cards. */
const JOB_COVERS: Record<string, string> = {
  "J-01": img("stock/woman-at-door.jpg"),
  "J-02": img("stock/plumber-pipes.jpg"),
  "J-03": img("jobs/solar.jpg"),
  "J-04": img("stock/lagos-colleagues-laptop.jpg"),
  "J-05": img("auth/professional.jpg"),
  "J-06": img("stock/lagos-street.jpg"),
  "J-07": img("jobs/building.png"),
  "J-08": img("auth/photographer.jpg"),
}

/** Extra photos for each job's gallery (cover first). */
const JOB_GALLERY: Record<string, string[]> = {
  "J-01": [img("stock/woman-at-door.jpg"), img("stock/lagos-office-meeting.jpg"), img("stock/woman-phone-lagos.jpg")],
  "J-02": [img("stock/plumber-pipes.jpg"), img("stock/mechanics-at-work.jpg")],
  "J-03": [img("jobs/solar.jpg"), img("jobs/tiling.png"), img("jobs/building.png")],
  "J-04": [img("stock/lagos-colleagues-laptop.jpg"), img("jobs/event.png")],
  "J-05": [img("auth/professional.jpg"), img("jobs/event.png")],
  "J-06": [img("stock/lagos-street.jpg"), img("stock/carpenter-workshop.jpg")],
  "J-07": [img("jobs/building.png"), img("jobs/painting.jpg"), img("jobs/tiling.png")],
  "J-08": [img("auth/photographer.jpg"), img("jobs/event.png"), img("jobs/makeup.png")],
}

const FALLBACK_COVERS = [img("stock/lagos-street.jpg"), img("stock/carpenter-workshop.jpg"), img("stock/lagos-office-meeting.jpg")]

export function jobCover(jobId: string): string {
  return JOB_COVERS[jobId] ?? FALLBACK_COVERS[jobId.length % FALLBACK_COVERS.length]
}

export function jobGallery(jobId: string): string[] {
  return JOB_GALLERY[jobId] ?? [jobCover(jobId)]
}

/** Covers for business accounts and promotions without a job photo. */
const BUSINESS_COVERS = [
  img("stock/lagos-office-meeting.jpg"),
  img("stock/carpenter-workshop.jpg"),
  img("stock/woman-laptop-phone.jpg"),
  img("stock/mechanics-at-work.jpg"),
  img("auth/chef.jpg"),
  img("jobs/event.png"),
]

export function coverFor(seed: string): string {
  let sum = 0
  for (let i = 0; i < seed.length; i++) sum += seed.charCodeAt(i)
  return BUSINESS_COVERS[sum % BUSINESS_COVERS.length]
}

/** Work photos for the hair/beauty demo provider, used on worker profiles. */
export const WORK_PHOTOS = [img("work/hair-0.jpg"), img("work/hair-1.jpg"), img("work/hair-2.jpg"), img("work/hair-3.jpg")]
