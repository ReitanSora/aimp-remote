export const isValidIPv4 = (ip: string): boolean => {
  const cleanIP = ip.trim();

  const ipv4Regex =
    /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

  return ipv4Regex.test(cleanIP);
};

export const checkServer = async (ip: string): Promise<boolean> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    try {
        const response = await fetch(`http://${ip}:3553/player/state`, {
            method: 'GET',
            signal: controller.signal,
            headers: {
                'Accept': 'application/json',
            },
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            return false;
        }

        return true;
    } catch (error) {
        clearTimeout(timeoutId);
        return false;
    }
};