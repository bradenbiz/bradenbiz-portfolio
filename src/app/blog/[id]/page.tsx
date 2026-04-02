import { format } from "date-fns";
import Link from "next/link";
import { notFound } from "next/navigation";

const blogPosts = [
  {
    id: "the-spectrum-of-developers",
    date: new Date("2026-04-02"),
    title: "The Spectrum of Developers: Builders vs. Coders in the Age of AI",
    content: `
      <p>When it comes to using AI for coding, in my personal experience with the various friends and coworkers I've had in my career, I've noticed that there are several different types of people when it comes to coding. I've always kind of been a black sheep in my job as a programmer. I've never really been the kind of guy. It comes down to it: there is a spectrum of people who, depending on how much they like coding versus how much they like building things. I don't know if it's a spectrum, but those are two bars that are either 100% or 0 to 100% for either of them.</p>

      <p>Those people, I've always been the person who has been 100% on making cool things, which is why I got into coding. I'm probably a 20% on the "enjoys to code." Yes, I can recognize that writing a really clean function can be really satisfying, or that resolving type errors can tickle my brain in a good way. In the end, I've always really enjoyed building things.</p>

      <h2>The Feedback Loop</h2>

      <p>I've always said that the reason I got into web development was because I loved how quickly the feedback loop was from idea to execution. That was always mind-blowing to me: how I could type something in HTML and then click refresh on my browser and see what I typed in a browser that someone else could see, and all I do is host it. My mind was even more blown when I learned about stuff like hot module reloading, where as soon as I typed it, it was out there. That kind of stuff was always my favorite thing, to see how quickly I could get things out.</p>

      <p>Another moment like that for me was Vercel, when I started using Vercel. And I saw how quickly I could just take code that I had written in my GitHub repository, click Connect it, and then immediately submit it and have it be deployed. It was just incredible to me how that could all happen so quickly, and now we have AI, which is this extreme new way.</p>

      <h2>Optimizing Away the Code</h2>

      <p>Another thing I should mention is that I really liked finding snippets and keyboard shortcuts. I've always been someone who highly optimized my VSCode, not because I was trying to save time. I just wanted to minimize the amount of time I had to spend coding and being deep in code and stuff like that. It was something that I felt like anyone can understand: any deep work is really good for your brain and satisfying, but it wasn't something that I really truly enjoyed necessarily.</p>

      <p>I was always really interested to try to find a VSCode extension that could take some code I'd written and extrapolate it into a different TypeScript file, or take this and turn it into an arrow function for me automatically. I really tried to get into those things because typing out code was never really something I enjoyed or liked making things more efficient. I liked improving things, but in the end it was all about delivering a product to a user. It is about making something interesting that someone uses. Of course, it has to be:</p>

      <ul>
        <li>usable</li>
        <li>reliable</li>
        <li>secure</li>
        <li>efficient</li>
        <li>cost-effective</li>
      </ul>

      <h2>The AI Mirror</h2>

      <p>These things, but in the end it was about delivering the product. This AI revolution has really exposed the type of people and has really shown people who I think it is, like a mirror showing developers what kind of developers they are.</p>

      <p>There are people like me, and this is just a dream come true because I don't have to worry about spending time coding. It is all about building the product, and I can spend all my time doing that now. There is a danger that it is not very secure, because I can miss things, so I do have to make sure I do that. In the end I have more energy for that, because I am spending overall less time coding. And instead I am just spending time building the thing.</p>

      <p>In fact, as recently as about five years ago, I strongly considered, or even tried, getting into product management because product management, in my mind, was really closer to building the thing than even coding. I was getting caught up in really tough sprint cycles where I was spending weeks debugging very silly, simple things that were just a lot of nitty-gritty stuff that I really didn't enjoy doing. I was saying I have to get away from this, and maybe product management is the way to do this, since I'm more of a people person. I'm more interested in actual, actual feedback, so I even considered going that route. But the AI thing kind of exposed it and made me realize I've been in the perfect thing all along. This has just been a total godsend. Truly a gift from God to me that I can now code and get feedback. This is what coding always wanted to be. It could not have gotten better for me in this regard.</p>

      <h2>The Other Side of the Spectrum</h2>

      <p>But for a lot of people, you realize there are some people who don't really enjoy shipping things to users. Some people are like the opposite of me, where they have a 20% enjoyment of shipping things to users. They can recognize that it's fun and it's good to get good feedback and stuff like that, but they really don't enjoy trying to figure out what a user really meant by something, responding to negative feedback, or trying to solve their problem instead of just solving the code problem that they have. They are a little bit selfish in that way.</p>

      <p>These people, they love getting into the code. They loved optimizing it, they loved making it clean, they love building infrastructure, architecting it, and they loved all these different things. They didn't enjoy the building things aspect, and those people, it's mind-blowing to me. We're still going to need those people, but those people are going to really have to work to find different jobs if they really don't like that, because it's making it easier to do that and it's less needed, just spending time in the code portion. Those people have it hard, for sure, and that's tough, but at the same time they are still needed elsewhere, and they can find somewhere where they fit that role, probably.</p>

      <h2>The Ones Who Have It Hardest</h2>

      <p>The people I think really have it the worst are the people who have a 100% love of developing and a 100% love of delivering, because now the best way to deliver is not to spend all your time coding. If you're someone who really enjoys coding and really enjoys delivering and also sees the value in that and enjoys getting feedback from customers, then making changes in the code, these are the people who were the 10x developers these past 15 years. The guys who could talk to our customers but also could get into logs and find some bug issue in AWS or something like that. I mean, these are the type of guys you really want on your team.</p>

      <p>But now I think they're really going to struggle, because the question is now, how do I use AI without losing my ability to get into the code and stuff like that? I mean, I think that maybe the answer is just you have to get into the AI; you really have to put that coding energy into it. I need to understand these AI models and what's the best way to use them. I don't know what that means or how you can even get to a level where it's nitty-gritty, as it was with coding, but I think those are the people I really feel are going to struggle the most, because it will be undeniable that they have this new coding ability that allows them to deliver to customers faster, but it's at the sacrifice of not being able to code.</p>

      <p>It's like you kind of have to pick one or the other: do I want to quit my role or find a role, or have my job transformed into a role where I'm only coding and I'm not really delivering much? It's just really in-depth code stuff, or do I want to transition to a role where I am just delivering stuff and I'm barely looking at code?</p>
    `,
  },
  {
    id: "things-i-will-not-do",
    date: new Date("2024-01-15"),
    title: "Things I Will Not Do",
    content: `
      <p>A list of commitments and boundaries I've set for myself to stay focused on what's important and avoid common pitfalls.</p>

      <h2>Work</h2>
      <h3>Check work email after 6 PM</h3>
      <p>I will not check or respond to work emails after 6 PM to maintain work-life balance.</p>

      <h2>Personal Finance</h2>
      <h3>Buy things on impulse</h3>
      <p>I will not make purchases without waiting 24 hours to think about whether I really need it.</p>

      <h2>Health</h2>
      <h3>Skip morning exercise</h3>
      <p>I will not skip my morning workout routine, even when I'm busy or tired.</p>
    `,
  },
  {
    id: "building-the-website",
    date: new Date("2024-01-16"),
    title: "Building the Website",
    content: `
      <h2>Building the Website</h2>
      <p>Continued working on the website structure today. I'm planning to add more features like:</p>
      <ul>
        <li>Markdown support for blog posts</li>
        <li>Image uploads</li>
        <li>API integrations</li>
        <li>Search functionality</li>
      </ul>
    `,
  },
  {
    id: "getting-started",
    date: new Date("2024-01-15"),
    title: "Getting Started",
    content: `
      <h2>First Blog Post</h2>
      <p>This is my first blog post on my new website. I'm excited to start documenting my thoughts and experiences here.</p>
      <p>Today I worked on setting up this website with Next.js, TypeScript, and Tailwind CSS. It's been a great learning experience.</p>
      <h3>What I learned:</h3>
      <ul>
        <li>Next.js App Router is powerful</li>
        <li>TypeScript makes development much more reliable</li>
        <li>Tailwind CSS is incredibly fast for styling</li>
      </ul>
    `,
  },
];

interface BlogPostPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { id } = await params;
  const post = blogPosts.find((p) => p.id === id);

  if (!post) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <div className="mb-4">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {post.title}
            </h1>
            <time className="text-lg text-gray-500">
              {format(post.date, "EEEE, MMMM d, yyyy")}
            </time>
          </div>
        </header>

        <article className="prose prose-lg max-w-none bg-white p-8 rounded-lg shadow-md border border-gray-200">
          <div
            dangerouslySetInnerHTML={{ __html: post.content }}
            className="prose-headings:text-gray-900 prose-p:text-gray-700 prose-ul:text-gray-700 prose-li:text-gray-700"
          />
        </article>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <Link
            href="/blog"
            className="text-blue-600 hover:text-blue-800 transition-colors"
          >
            &larr; Back to all posts
          </Link>
        </div>
      </div>
    </div>
  );
}
