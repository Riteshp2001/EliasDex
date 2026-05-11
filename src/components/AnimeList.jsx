import Link from "next/link";
import Heading from "../components/Heading";
import Image from "../components/Image";
import { FaAngleRight } from "react-icons/fa";
import { useApi } from "../services/useApi";
import Loader from "../components/Loader";

const AnimeList = ({ title, endpoint }) => {
  const { data, isError, isLoading } = useApi(
    `/top/anime?filter=${endpoint}&limit=24`,
  );
  return (
    <>
      {!isLoading ? (
        <div className="pb-5">
          <div className="header flex justify-between">
            <Heading>{title}</Heading>
            <Link href={`/${endpoint}`}>
              <h6 className="text-sm hover:text-primary flex mr-4 items-center gap-1 text-neutral-400">
                <span>View more</span>
                <FaAngleRight />
              </h6>
            </Link>
          </div>
          <div className="wrapper flex justify-around flex-wrap h-full w-full">
            {data &&
              data.data?.map((item) => (
                <div key={item.mal_id} className="flw-item">
                  <Image data={item} alt={item.title} key={item.mal_id} />
                </div>
              ))}
          </div>
        </div>
      ) : (
        <Loader />
      )}
    </>
  );
};

export default AnimeList;
