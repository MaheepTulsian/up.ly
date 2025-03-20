import React from "react";
import Vid from "./Vid";
import AIpic from "./AIpic";
import { Button } from "../ui/button";

const Integrate = () => {
  return (
    <>
      <div className="grid grid-cols-2 gap-10 w-full px-4 py-8 bg-slate-500">
        <div className="col-span-1 bg-slate-400 flex justify-center items-center">
          <AIpic />
        </div>
        <div className="col-span-1">
          <Vid />
        </div>
      </div>
      <div className="absolute bottom-4 md:bottom-10 left-1/2 transform -translate-x-1/2">
        <Button variant="destructive">End Interview</Button>
      </div>
    </>
  );
};

export default Integrate;
