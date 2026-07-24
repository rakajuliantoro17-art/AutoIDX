"use client";

export default function ActivityError({

  error,

  reset,

}:{

  error: Error;

  reset: () => void;

}){

  return(

    <div className="glass p-8">

      <h2 className="text-2xl text-red-500">

        Activity Error

      </h2>

      <p className="mt-4">

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
