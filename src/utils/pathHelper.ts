export const resolvePath = (path: string): string => {
    const baseUrl = import.meta.env.BASE_URL;
    // Remove leading slash from path if it exists to avoid double slashes
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    // Ensure baseUrl ends with slash
    const cleanBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;

    return `${cleanBase}${cleanPath}`;
};
