import { Link } from "react-router-dom";
export default function NotFound() {
  return (
    <div className="flex space-y-4 flex-col justify-center items-center min-h-screen bg-stone-100">
      <div className="font-bold text-4xl text-stone-400">Not Found</div>
      <div className="text-stone-500 text-lg">해당하는 페이지가 없습니다.</div>
      <Link to="/" className="underline text-purple-400">
        홈으로 가기
      </Link>
    </div>
  );
}
