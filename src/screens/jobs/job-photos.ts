import { jobCover, jobGallery } from "@/lib/photos"
import type { JobListing } from "@/lib/mock-data"

/** The job's own cover: photos added when it was posted, else the stock cover for its id. */
export function jobPhoto(job: JobListing) {
  return job.photos?.[0] ?? jobCover(job.id)
}

export function jobPhotos(job: JobListing) {
  return job.photos?.length ? job.photos : jobGallery(job.id)
}
