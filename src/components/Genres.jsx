import Link from "next/link";
import { genres } from "../utils/genres";

const Genres = ({ className }) => {
  const colors = [
    "#d0e6a5",
    "#ffbade",
    "#fc887b",
    "#ccabda",
    "#abccd8",
    "#d8b2ab",
    "#86e3ce",
  ];

  return (
    <ul className={`flex flex-wrap `}>
      {genres.map((genre, index) => (
        <li
          style={{ color: colors[index % colors.length] }}
          className={`${className} `}
          key={genre.mal_id}
          title={genre.name}
        >
          <Link href={`/search?order_by=end_date&sfw=false&genres=${genre.mal_id}`}>{genre.name}</Link>
        </li>
      ))}
    </ul>
  );
};

export default Genres;
