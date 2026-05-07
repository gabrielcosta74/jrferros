import { staticServices } from '../src/lib/staticApiData';

type ApiResponse = {
  setHeader(name: string, value: string): void;
  status(code: number): ApiResponse;
  json(body: unknown): void;
};

export default function handler(_req: unknown, res: ApiResponse) {
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=86400');
  return res.status(200).json({
    data: staticServices(),
    source: 'static',
  });
}
