"use client";

export default function Error({

    error,

    reset,

}:{

    error: Error;

    reset: () => void;

}){

    return(

        <div className="glass p-8">

            <h2 className="text-red-500 text-2xl">

                Something went wrong

            </h2>

            <p className="mt-3">

                {error.message}

            </p>

            <button
                onClick={reset}
                className="btn btn-primary mt-6"
            >

                Retry

            </button>

        </div>

    );

}
