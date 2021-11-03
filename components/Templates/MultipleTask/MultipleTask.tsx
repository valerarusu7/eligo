import { BiSelectMultiple } from "react-icons/bi";
import EmailChoice from "../Choice";

function MultipleTask({ task }) {
  return (
    <div className="bg-white mt-10 rounded-lg  p-4 shadow-lg relative">
      <div className="bg-red-200 w-full flex justify-center items-center">
        <div className="rounded-full bg-gradient-to-tr from-purple-500 to-purple-400 h-12 w-12 flex justify-center items-center disabled:opacity-50 transition transform duration-400 ease-in-out absolute -top-4 shadow-lg">
          <BiSelectMultiple className="text-white h-8 w-8" />
        </div>
      </div>
      <div className="w-full mt-8 p-2">
        <div>
          <label
            htmlFor="company-website"
            className="block text-md font-medium text-gray-700"
          >
            Question
          </label>
          <div className="mt-1 flex rounded-md shadow-sm">
            <textarea
              className="mt-1 w-full resize-none"
              rows={3}
              placeholder="Enter the question here."
            ></textarea>
          </div>
        </div>

        <div className="mt-6 flex items-center">
          <div className="w-1/3">
            <label
              htmlFor="company-website"
              className="block text-md font-medium text-gray-700"
            >
              Choices
            </label>
          </div>
        </div>

        <div className="mt-4">
          <EmailChoice
            id={1}
            onChange={(e) => console.log(e.target.value)}
            prefferedChoice
            color="purple"
          />
          <EmailChoice
            id={2}
            onChange={(e) => console.log(e.target.value)}
            prefferedChoice={false}
            color="purple"
          />
          <div className="mt-2">
            <button className="rounded-lg text-white bg-gradient-to-tr from-purple-500 to-purple-400 pl-4 pr-4 pt-2 pb-2 font-semibold hover:opacity-80">
              Add choice
            </button>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-end">
          <button className="bg-green-500 text-white font-semibold pl-4 pr-4 pt-2 pb-2 rounded-lg shadow-lg hover:opacity-80">
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

export default MultipleTask;
