import Link from "next/link";

export default function NotFound(){

    return(

        <div className="glass p-10 text-center">

            <h1 className="text-5xl font-bold">

                404

            </h1>

            <p className="mt-3">

                Page not found.

            </p>

            <Link
                href="/"
                className="btn btn-primary mt-6 inline-flex"
            >

                Back Home

            </Link>

        </div>

    );

}
