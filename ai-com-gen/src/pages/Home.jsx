import { useState } from "react";
import Select from "react-select";
import { Editor } from "@monaco-editor/react";
import Navbar from "../components/Navbar";
import { BsStars } from "react-icons/bs";
import { HiOutlineCode } from "react-icons/hi";
import { IoCloseSharp, IoCopy } from "react-icons/io5";
import { PiExport, PiExportBold } from "react-icons/pi";
import { FiRefreshCcw } from "react-icons/fi";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { ClipLoader } from "react-spinners";
import { toast } from "react-toastify";

function Home() {
  const options = [
    { value: "html-css", label: "HTML + CSS" },
    { value: "html-tailwind", label: "HTML + TAILWIND CSS" },
    { value: "html-bootstrap", label: "HTML + BOOTSTRAP" },
    { value: "html-css-js", label: "HTML + CSS + JS" },
    { value: "html-css-react", label: "HTML + CSS + REACT" },
    { value: "react-node-css", label: "REACT + NODE + CSS" },
    { value: "react-node-tailwind", label: "REACT + NODE + TAILWIND" },
  ];

  const [outputScreen, setOutputScreen] = useState(false);
  const [tab, setTab] = useState(1);
  const [promt, setPromt] = useState("");
  const [framework, setFramework] = useState(options[0]);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [isNewTab, setIsNewTab] = useState(false);

  function extractCode(response) {
    const match = response.match(/```(?:\w+)?\n?([\s\S]*?)```/);
    return match ? match[1].trim() : response;
  }

  const ai = new GoogleGenerativeAI("AIzaSyBytEunCJb2qEQcUei_pyXdhDxZ0QQxUs4");

  async function getResponse() {
    setLoading(true);
    try {
      const model = ai.getGenerativeModel({ model: "gemini-2.0-flash" });

      const promptText = `
You are an experienced programmer with expertise in web development and UI/UX design. You create modern, animated, and fully responsive UI components.

Now, generate a UI component for: ${promt}
Framework to use: ${framework.value}

Requirements:
The code must be clean, well-structured, and easy to understand.
Optimize for SEO where applicable.
Focus on creating a modern, animated, and responsive UI design.
Include high-quality hover effects, shadows, animations, colors, and typography.
Return ONLY the code, formatted properly in Markdown fenced code blocks.
And give the whole code in a single HTML file.
      `;

      const result = await model.generateContent(promptText);
      const text = result.response.text();

      const extracted = extractCode(text);
      setCode(extracted);
      setOutputScreen(true);
    } catch (err) {
      console.error("Error generating code:", err);
      toast.error("Failed to generate code");
    } finally {
      setLoading(false);
    }
  }

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      toast.success("Code copied to clipboard");
    } catch (err) {
      console.error("Failed to copy: ", err);
      toast.error("Failed to copy");
    }
  };

  const downloadFile = () =>{
    const fileName = "GenUI-Code.html"
    const blob = new Blob([code], {type: 'text/plain'});
    let url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("File Downloaded")
  }

  return (
    <>
      <Navbar />
      <div className="flex items-center px-[100px] justify-between gap-[30px]">
        <div className="left w-[50%] h-[auto] py-[30px] rounded-xl bg-[#141319] mt-5 p-[20px]">
          <h3 className="text-[25px] font-semibold sp-text">
            AI component generator
          </h3>
          <p className="text-[gray] mt-2 text[16px]">
            Describe your component and let AI code for you
          </p>

          <p className="text-[15px] font-[700] mt-4">Framework</p>
          <Select
            className="mt-2"
            options={options}
            placeholder="Select an option"
            styles={{
              control: (base) => ({
                ...base,
                backgroundColor: "#000",
                color: "#fff",
                borderColor: "#444",
                boxShadow: "none",
                "&:hover": {
                  borderColor: "#666",
                },
              }),
              menu: (base) => ({
                ...base,
                backgroundColor: "#111",
                color: "#fff",
              }),
              option: (base, state) => ({
                ...base,
                backgroundColor: state.isFocused
                  ? "#222"
                  : state.isSelected
                  ? "#333"
                  : "#000",
                color: "#fff",
                "&:active": {
                  backgroundColor: "#444",
                },
              }),
              singleValue: (base) => ({
                ...base,
                color: "#fff",
              }),
              placeholder: (base) => ({
                ...base,
                color: "#aaa",
              }),
              input: (base) => ({
                ...base,
                color: "#fff",
              }),
            }}
            theme={(theme) => ({
              ...theme,
              colors: {
                ...theme.colors,
                primary25: "#222",
                primary: "#444",
                neutral0: "#000",
                neutral80: "#fff",
              },
            })}
            onChange={(e) => setFramework(e)}
          />
          <p className="text-[15px] font-[700] mt-5">Describe your component</p>
          <textarea
            onChange={(event) => setPromt(event.target.value)}
            value={promt}
            className="w-full min-h-[200px] rounded-xl bg-[#09090B] mt-3 p-[10px]"
            placeholder="Describe your component in detail and let AI code for it"
          ></textarea>
          <div className="flex items-center justify-between">
            <p className="text-[gray]">
              Click on generate button to generate your code
            </p>
            <button
              onClick={getResponse}
              className="generate flex items-center p-[15px] rounded-lg border-0 bg-gradient-to-r from-purple-400 to-purple-600 mt-3  px-[20px] gap-[10px] transition-all hover:opacity-[.8]"
            >
              {
                loading === false ? 
                <>
              <i>
                <BsStars />
              </i>
                </> : " "
              }
              {loading ===true ? <ClipLoader color="#fff" size={20} /> : null}
              Generate
            </button>
          </div>
        </div>
        <div className="right relative mt-2 w-[50%] h-[80vh] bg-[#141319] rounded-xl">
          {outputScreen === false ? (
            <div className="skeleton w-full h-full flex items-center flex-col justify-center">
              <div className="circle p-[20px] w-[70px] flex items-center justify-center text-[30px] h-[70px] rounded-[50%] bg-gradient-to-r from-purple-400 to-purple-600">
                <HiOutlineCode />
              </div>
              <p className="text-[16px] text-[gray] mt-3">
                Your component & code will appear here
              </p>
            </div>
          ) : (
            <>
              <div className="top bg-[#17171c] w-full h-[60px] flex items-center gap-[15px] px-[20px]">
                <button
                  onClick={() => setTab(1)}
                  className={`btn w-[50%] p-[10px] rounded-xl cursor-pointer transition-all ${
                    tab === 1 ? "bg-[#333]" : ""
                  }`}
                >
                  Code
                </button>
                <button
                  onClick={() => setTab(2)}
                  className={`btn w-[50%] p-[10px] rounded-xl cursor-pointer transition-all ${
                    tab === 2 ? "bg-[#333]" : ""
                  }`}
                >
                  Previous
                </button>
              </div>

              <div className="top-2 bg-[#17171c] w-full h-[60px] flex items-center justify-between gap-[15px] px-[20px]">
                <div className="left">
                  <p className="font-bold">Code Editor</p>
                </div>

                <div className="right flex items-center gap-[10px]">
                  {tab === 1 ? (
                    <>
                      <button
                        className="copy w-[40px] h-[40px] rounded-xl border-[1px] border-zinc-800 flex items-center justify-center transition-all hover:bg-[#333]"
                        onClick={copyCode}
                      >
                        <IoCopy />
                      </button>
                      <button className="export w-[40px] h-[40px] rounded-xl border-[1px] border-zinc-800 flex items-center justify-center transition-all hover:bg-[#333]" onClick={downloadFile}>
                        <PiExport />
                      </button>
                    </>
                  ) : (
                    <>
                      <button className="copy w-[40px] h-[40px] rounded-xl border-[1px] border-zinc-800 flex items-center justify-center transition-all hover:bg-[#333]" onClick={()=>{setIsNewTab(true)}}>
                        <PiExportBold />
                      </button>
                      <button className="export w-[40px] h-[40px] rounded-xl border-[1px] border-zinc-800 flex items-center justify-center transition-all hover:bg-[#333]">
                        <FiRefreshCcw />
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="editor h-full">
                {tab === 1 ? (
                  <Editor value={code} height="100%" theme="vs-dark" language="html" />
                ) : (
                  <iframe  srcDoc={code} className="preview w-full h-full bg-white text-black flex items-center justify-center"></iframe>
                )}
              </div>
            </>
          )}
        </div>
      </div>
      {
        isNewTab === true ?
        <>
        <div className="container absolute left-0 top-0 right-0 bottom-0 bg-white w-screen min-h-screen overflow-auto">
          <div className="top w-full h-[60px] flex items-center justify-between px-[20px]">
            <div className="left">
              <p className="font-bold">Preview</p>
            </div>
            <div className="right flex items-center gap-[10px]">
              <button className="copy w-[40px] rounded-xl border-[1px] border-zinc-800 flex items-center justify-center transition-all hover:bg-[#333]" onClick={()=>{setIsNewTab(false)}}><IoCloseSharp/></button>
            </div>
          </div> 
          <iframe srcDoc={code} className="w-full h-full"></iframe>
        </div>
        </> : ""
      }
    </>
  );
}

export default Home;
