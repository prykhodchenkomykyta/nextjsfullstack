"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import React, { useState } from "react";

type Inputs = {
  title: string;
  desc: string;
  price: number;
  catSlug: string;
};

type Option = {
  title: string;
  additionalPrice: number;
};

const AddPage = () => {
  const { data: session, status } = useSession();
  const [inputs, setInputs] = useState<Inputs>({
    title: "",
    desc: "",
    price: 0,
    catSlug: "",
  });

  const [option, setOption] = useState<Option>({
    title: "",
    additionalPrice: 0,
  });

  const [options, setOptions] = useState<Option[]>([]);

  const [file, setFile] = useState<File>();

  const router = useRouter();

  if (status === "loading") {
    return <p>...Loading</p>;
  }

  if (status === "unauthenticated" || !session?.user.isAdmin) {
    router.push("/");
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setInputs((prev) => {
      return { ...prev, [e.target.name]: e.target.value };
    });
  };

  const changeOption = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOption((prev) => {
      return { ...prev, [e.target.name]: e.target.value };
    });
  };

  const upload = async () => {
    const data = new FormData();
    data.append("file", file!);
    data.append("upload_preset", "pizza-app");
    const res = await fetch(
      "https://api.cloudinary.com/v1_1/mykytaprykhodchenko/image",
      {
        method: "POST",
        headers: { "Content-Type": "multipart/form-data" },
        body: data,
      }
    );

    const resData = await res.json();
    return resData.url;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const url = await upload();
      const res = await fetch("http://localhost:3000/api/products", {
        method: "POST",
        body: JSON.stringify({ img: url, ...inputs, options }),
      });

      const data = await res.json();
      router.push(`/product/${data.id}`);
    } catch (err) {
      console.log(err);
    }
  };

  const handleChangeImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const target = e.target as HTMLInputElement;
    const item = (target.files as FileList)[0];
    setFile(item);
  };

  return (
    <div>
      <form
        className="shadow-lg flex flex-wrap gap-4 p-8"
        onSubmit={handleSubmit}
      >
        <h1>Add New Product</h1>
        <div className="w-full flex flex-col gap-2">
          <label>Image</label>
          <input
            className="ring-1 ring-red-200 p-2 rounded-sm"
            type="file"
            placeholder="Image"
            onChange={handleChangeImage}
          />
        </div>
        <div className="w-full flex flex-col gap-2">
          <label>Title</label>
          <input
            onChange={(e) => {
              handleChange(e);
            }}
            className="ring-1 ring-red-200 p-2 rounded-sm"
            placeholder="Title"
            type="text"
            name="catSlug"
          />
        </div>
        <div className="w-full flex flex-col gap-2">
          <label>Description</label>
          <textarea
            placeholder="Description"
            name="desc"
            onChange={(e) => {
              handleChange(e);
            }}
          />
        </div>
        <div className="w-full flex flex-col gap-2">
          <label>Price</label>
          <input
            onChange={(e) => {
              handleChange(e);
            }}
            className="ring-1 ring-red-200 p-2 rounded-sm"
            placeholder="Price"
            type="number"
            name="price"
          />
        </div>
        <div className="w-full flex flex-col gap-2">
          <label>Category</label>
          <input
            onChange={(e) => {
              handleChange(e);
            }}
            className="ring-1 ring-red-200 p-2 rounded-sm"
            placeholder="Category"
            type="text"
            name="category"
          />
        </div>
        <div className="w-full flex flex-col gap-2">
          <label>Options</label>
          <div>
            <input
              onChange={changeOption}
              className="ring-1 ring-red-200 p-2 rounded-sm"
              placeholder="Title"
              type="text"
              name="title"
            />
            <input
              onChange={changeOption}
              className="ring-1 ring-red-200 p-2 rounded-sm"
              placeholder="Additional Price"
              type="number"
              name="additionalPrice"
            />
          </div>
          <button
            onClick={() => setOptions((prev) => [...prev, option])}
            className="w-52 bg-red-500 text-white p-2 "
          >
            Add Options
          </button>
        </div>
        <div>
          {options.map((item) => (
            <div
              className="ring-1 p-2 ring-red-500 rounded-md cursor-pointer"
              key={item.title}
              onClick={() =>
                setOptions(options.filter((opt) => opt.title !== item.title))
              }
            >
              <span>{item.title}</span>
              <span>${item.additionalPrice}</span>
            </div>
          ))}
        </div>
        <button type="submit" className="p-2 w-full bg-red-500 text-white">
          Submit
        </button>
      </form>
    </div>
  );
};

export default AddPage;
