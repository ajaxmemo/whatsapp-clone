/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
		remotePatterns: [
			{ hostname: "mellow-monitor-820.convex.cloud" }
			// { hostname: "oaidalleapiprodscus.blob.core.windows.net" },
		],
	},
};

export default nextConfig;
