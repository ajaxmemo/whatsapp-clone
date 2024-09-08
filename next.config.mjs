/** @type {import('next').NextConfig} */
const nextConfig = {
	typescript: {
		// !! WARN !!
		// Dangerously allow production builds to successfully complete even if
		// your project has type errors.
		// !! WARN !!
		ignoreBuildErrors: true,
	  },
    images: {
		remotePatterns: [
			{ hostname: "mellow-monitor-820.convex.cloud" }
			// { hostname: "oaidalleapiprodscus.blob.core.windows.net" },
		],
	},
	eslint: {
		ignoreDuringBuilds: true,
	},
};

export default nextConfig;
