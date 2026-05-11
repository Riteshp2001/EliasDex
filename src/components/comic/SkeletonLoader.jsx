import React from 'react'

const SkeletonLoader = ({ count = 6, type = 'card' }) => {
  if (type === 'card') {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
        {Array.from({ length: count }).map((_, index) => (
          <div
            key={index}
            className="animate-pulse bg-white/80 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-300 dark:border-gray-700"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* Image skeleton with fixed aspect ratio */}
            <div className="relative aspect-[2/3] bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
            </div>

            {/* Content skeleton */}
            <div className="p-4 space-y-3">
              {/* Title skeleton */}
              <div className="space-y-2">
                <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded w-full"></div>
                <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded w-3/4"></div>
              </div>

              {/* Button skeleton */}
              <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-lg"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return null
}

export default SkeletonLoader
