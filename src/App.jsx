import { useEffect, useMemo, useRef, useState } from "react";
import { AdminPage } from "./AdminPage";
import {
  ArrowRight,
  Briefcase,
  Buildings,
  CalendarDots,
  Check,
  ClipboardText,
  CloudArrowUp,
  Code,
  Compass,
  FilmSlate,
  GlobeHemisphereEast,
  Handshake,
  List,
  MapPin,
  Megaphone,
  Play,
  RocketLaunch,
  Sparkle,
  Target,
  TrendUp,
  Trophy,
  UserFocus,
  UsersThree,
  X,
} from "@phosphor-icons/react";

const NAV_ITEMS = [
  ["首页", "home"],
  ["一分钟短片创作大赛", "short-film"],
  ["大会介绍", "about"],
  ["赛程与说明", "schedule"],
  ["企业需求", "enterprise"],
  ["AIGC产业实践单元", "aigc"],
  ["了解OPCWISE", "opcwise"],
];

const enterpriseCategories = [
  ["企业AI战略与需求诊断", "AI应用规划、场景梳理、转型路径与项目可行性评估。", Compass],
  ["数据、知识库与专属模型", "企业数据治理、RAG检索、智能问答与经营决策支持。", Code],
  ["智能办公与流程自动化", "智能客服、文档处理、销售跟进与Agent数字员工。", Sparkle],
  ["产品与服务智能化", "传统产品AI升级、AI原生产品、智能硬件与行业应用。", RocketLaunch],
  ["营销、客户与商业增长", "客户洞察、智能获客、电商运营与转化提升。", TrendUp],
  ["品牌、内容与数字创意", "AI广告、短视频、影视短剧、数字人与虚拟IP。", Megaphone],
  ["生产、供应链与产业提效", "质量检测、预测维护、供应链优化与工业视觉。", Buildings],
  ["组织人才与AI能力建设", "企业AI培训、岗位升级、人才招聘与应用陪跑。", UsersThree],
  ["城市、园区与公共服务", "园区数字化、公共文化服务与区域AI产业生态。", GlobeHemisphereEast],
];

const aigcDirections = [
  ["AI影视与短片", "影片、短片与企业宣传内容", FilmSlate],
  ["AI短剧与漫剧", "连续内容、竖屏内容与制作服务", Play],
  ["AI广告与品牌内容", "品牌传播、产品营销与商业推广", Megaphone],
  ["AI短视频与账号运营", "内容矩阵、IP运营与平台传播", TrendUp],
  ["AI数字人与虚拟IP", "数字人内容、虚拟形象与IP应用", UserFocus],
  ["AI电商与产品内容", "商品展示、种草、带货与转化", Briefcase],
  ["AI文旅及城市内容", "文旅、园区、城市与文化场景", MapPin],
  ["其他产业实践", "动画、视觉设计、音乐及更多应用", Sparkle],
];

const evaluation = [
  ["产业价值", "是否对应真实行业、客户或用户需求。"],
  ["实践成果", "是否形成作品、项目、客户、收入、岗位或合作成果。"],
  ["项目交付能力", "是否能够稳定完成真实任务并配合项目推进。"],
  ["专业能力", "是否具备相应的AIGC创作、制作和实施基础。"],
  ["发展潜力", "是否具备进一步创业、就业或产品化发展的可能。"],
];

function useHashRoute() {
  const read = () => window.location.hash.replace(/^#\/?/, "") || "home";
  const [route, setRoute] = useState(read);
  useEffect(() => {
    const onHash = () => setRoute(read());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  return route;
}

function go(route) {
  window.location.hash = `#/${route}`;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function Brand({ compact = false }) {
  return (
    <button className="brand" onClick={() => go("home")} aria-label="返回 OPCWISE 首页">
      <img src="/assets/opcwise-mark.png" alt="" />
      <img src="/assets/logo.png" alt="" />
      {/* <span className="brand-copy">
        <strong>OPCWISE</strong>
        {!compact && <small>AI · OPC 创业者大会</small>}
      </span> */}
    </button>
  );
}

function Header({ route, onRegister }) {
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [route]);

  return (
    <header className="site-header">
      <div className="header-inner">
        <Brand />
        <nav className={open ? "main-nav is-open" : "main-nav"} aria-label="主要导航">
          {NAV_ITEMS.map(([label, key]) => (
            <button
              key={key}
              className={route === key ? "nav-link active" : "nav-link"}
              onClick={() => go(key)}
            >
              {label}
            </button>
          ))}
        </nav>
        <button className="button button-small header-cta" onClick={onRegister}>
          立即报名 <ArrowRight weight="bold" />
        </button>
        <button
          className="menu-button"
          aria-label={open ? "关闭导航" : "打开导航"}
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X /> : <List />}
        </button>
      </div>
    </header>
  );
}

function Button({ children, secondary = false, onClick, className = "" }) {
  return (
    <button className={`button ${secondary ? "button-secondary" : ""} ${className}`} onClick={onClick}>
      {children}
    </button>
  );
}

function RegistrationChooser({ onClose, onChoose }) {
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="choice-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="choice-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button className="modal-close" onClick={onClose} aria-label="关闭">
          <X />
        </button>
        <span className="eyebrow">CHOOSE YOUR PATH</span>
        <h2 id="choice-title">选择参与方式</h2>
        <p>企业发布真实 AI 需求，创作者与团队提交产业实践能力。选择入口后约 2—5 分钟即可完成。</p>
        <div className="choice-grid">
          <button className="choice-card" onClick={() => onChoose("enterprise")}>
            <span className="icon-tile"><Buildings /></span>
            <strong>发布企业 AI 需求</strong>
            <small>描述业务问题，由组委会协助梳理与匹配。</small>
            <span className="choice-action">进入企业表单 <ArrowRight /></span>
          </button>
          <button className="choice-card featured" onClick={() => onChoose("aigc")}>
            <span className="icon-tile"><RocketLaunch /></span>
            <strong>报名 AIGC 产业实践单元</strong>
            <small>提交现有作品、项目与商业实践材料。</small>
            <span className="choice-action">进入报名表 <ArrowRight /></span>
          </button>
          <button className="choice-card" onClick={() => { onClose(); go("short-film/upload"); }}>
            <span className="icon-tile"><FilmSlate /></span>
            <strong>一分钟短片创作大赛</strong>
            <small>上传一分钟短片作品，展示创意与制作能力。</small>
            <span className="choice-action">上传作品 <ArrowRight /></span>
          </button>
        </div>
      </section>
    </div>
  );
}

function HomePage({ onRegister }) {
  const highlights = [
    ["企业真实需求", "汇聚各行业企业真实AI内容与项目需求", Buildings],
    ["AIGC人才发现", "发现具备商业交付能力的创作者与团队", UserFocus],
    ["产业实践落地", "从需求到项目，推动AI技术在场景中落地", RocketLaunch],
    ["创业与就业赋能", "提供求职资源、创业机会与行业指导", Briefcase],
  ];

  const stats = [
    ["500+", "参会企业", UsersThree],
    ["1000+", "AIGC创作者", UserFocus],
    ["20+", "行业奖项", Trophy],
    ["全球连接", "国际化合作资源", GlobeHemisphereEast],
  ];

  return (
    <>
      <main className="home-main">
        <section className="hero">
          <div className="hero-copy">
            <h1><span>AI · OPC</span><br />创业者大会</h1>
            <p>
              连接企业真实需求，发现具备创业、就业与商业交付能力的 AIGC 人才。
              让创意被看见，让 AI 应用落地，让项目产生真实商业价值。
            </p>
            <div className="audience-line"><UsersThree /> 学员、创业者、创作者、企业均可报名</div>
            <div className="hero-actions">
              <Button onClick={onRegister}><ClipboardText /> 报名参赛 / 提交需求 <ArrowRight weight="bold" /></Button>
              <Button secondary onClick={() => go("about")}><Compass /> 了解 OPCWISE <ArrowRight weight="bold" /></Button>
            </div>
          </div>
          <div className="hero-visual" aria-label="OPCWISE 大会舞台现场">
            <img src="/assets/conference-stage.jpg" alt="OPCWISE 大会舞台与现场观众" />
            <div className="visual-caption">
              <span>2026 · AIGC 产业实践单元</span>
              <strong>让 AI 能力进入真实产业</strong>
            </div>
          </div>
        </section>

        <section className="stats-panel" aria-label="大会数据">
          {stats.map(([value, label, Icon]) => (
            <div className="stat" key={label}>
              <Icon />
              <div><strong>{value}</strong><span>{label}</span></div>
            </div>
          ))}
        </section>

        <section className="home-lower">
          <div className="panel highlights-panel">
            <SectionHeading title="大会亮点" />
            <div className="highlights-grid">
              {highlights.map(([title, text, Icon]) => (
                <article className="highlight" key={title}>
                  <Icon />
                  <strong>{title}</strong>
                  <p>{text}</p>
                </article>
              ))}
            </div>
          </div>
          <div className="panel moments-panel">
            <div className="panel-title-row">
              <SectionHeading title="精彩瞬间" />
              <button onClick={() => go("about")}>了解大会 <ArrowRight /></button>
            </div>
            <div className="moments-grid">
              {[1, 2, 3, 4, 5, 6].map((index) => (
                <img key={index} src={`/assets/moment-${index}.jpg`} alt={`OPCWISE 大会现场瞬间 ${index}`} />
              ))}
            </div>
          </div>
        </section>
      </main>

      <section className="content-section intro-strip">
        <div>
          <span className="eyebrow">WHAT IS OPCWISE</span>
          <h2>从企业问题出发，<br />让需求与能力真正相遇</h2>
        </div>
        <div className="intro-copy">
          <p>
            OPCWISE 是面向企业 AI 化与 AI·OPC 创业者的长期产业连接平台。
            大会是需求发布、能力验证与产业对接场域；AIGC 产业实践单元是首期启动单元，但不是全部。
          </p>
          <button className="text-link" onClick={() => go("opcwise")}>了解平台如何运转 <ArrowRight /></button>
        </div>
      </section>

      <section className="content-section double-entry">
        <article className="entry-card enterprise-entry">
          <span className="entry-number">01</span>
          <Buildings />
          <h3>企业提交真实 AI 需求</h3>
          <p>无需预先定义技术方案，只需描述经营、管理、生产、服务或增长中的问题。</p>
          <button onClick={() => go("enterprise")}>查看企业参与方式 <ArrowRight /></button>
        </article>
        <article className="entry-card aigc-entry">
          <span className="entry-number">02</span>
          <RocketLaunch />
          <h3>AIGC 创作者提交实践能力</h3>
          <p>作品是能力证明，我们更关注真实服务、商业项目、就业能力与创业价值。</p>
          <button onClick={() => go("aigc")}>了解首期实践单元 <ArrowRight /></button>
        </article>
      </section>
    </>
  );
}

function SectionHeading({ title, kicker }) {
  return (
    <div className="section-heading">
      {kicker && <span className="eyebrow">{kicker}</span>}
      <h2>{title}</h2>
    </div>
  );
}

function PageHero({ kicker, title, description, primary, secondary, visual = "conference-stage.jpg" }) {
  return (
    <section className="page-hero">
      <div className="page-hero-copy">
        <span className="eyebrow">{kicker}</span>
        <h1>{title}</h1>
        <p>{description}</p>
        <div className="page-actions">
          {primary}
          {secondary}
        </div>
      </div>
      <div className="page-hero-visual">
        <img src={`/assets/${visual}`} alt="" />
        <div className="page-visual-badge"><Sparkle /> OPCWISE · 产业连接平台</div>
      </div>
    </section>
  );
}

function AboutPage({ openForm }) {
  const why = [
    ["企业需要找到AI化入口", "把经营问题转化为清晰、可实施的 AI 需求。"],
    ["AI能力需要真实场景", "让技术、产品和方案获得客户、行业场景与持续订单。"],
    ["供需之间需要验证机制", "帮助企业判断谁真正理解业务并具备交付能力。"],
    ["产业需要新的协作方式", "让企业、AI·OPC 与产业资源共同推动项目落地。"],
  ];
  return (
    <main className="page-main">
      <PageHero
        kicker="ABOUT THE CONFERENCE"
        title="AI · OPC 创业者大会"
        description="连接企业真实 AI 需求，发现具备细分能力与产业交付价值的 AI·OPC 创业者。"
        primary={<Button onClick={() => openForm("aigc")}>报名 AIGC 产业实践单元 <ArrowRight /></Button>}
        secondary={<Button secondary onClick={() => openForm("enterprise")}>提交企业需求</Button>}
      />
      <section className="page-section prose-section">
        <SectionHeading kicker="大会是什么" title="面向 AI 时代新型创业者、企业需求与产业资源的全国性连接平台" />
        <div className="two-column-copy">
          <p>
            大会由 OPCWISE 发起，通过企业需求发布、解决方案征集、实践选拔、测试验证、
            路演对接和成果展示，发现能够运用 AI 解决真实问题并完成产业交付的人才、产品与项目。
          </p>
          <p>
            大会不只关注 AIGC，也关注企业知识库、专属模型、数据智能、Agent 数字员工、
            流程自动化、智能产品、工业应用、组织升级及更多泛 AI 产业方向。
          </p>
        </div>
      </section>
      <section className="page-section">
        <SectionHeading kicker="WHY OPCWISE" title="为什么举办" />
        <div className="reason-grid">
          {why.map(([title, text], index) => (
            <article className="reason-card" key={title}>
              <span>0{index + 1}</span><h3>{title}</h3><p>{text}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="page-section focus-layout">
        <SectionHeading kicker="WHAT WE VALUE" title="大会重点关注什么" />
        <div className="check-list">
          {[
            "是否发现并解决了真实问题，能够进入具体行业和业务场景。",
            "技术、产品、解决方案或专业服务是否具备可行性和实际应用价值。",
            "是否具备测试验证、项目实施与稳定交付能力。",
            "是否已经形成产品、试点、订单、就业、创业或产业合作成果。",
            "是否具备持续经营、规模化应用与产业协同价值。",
          ].map((item) => <div key={item}><Check weight="bold" /><span>{item}</span></div>)}
        </div>
      </section>
      <ProcessSection />
    </main>
  );
}

function ProcessSection() {
  const steps = [
    ["企业提出真实问题", "从经营与业务场景出发，无需预先定义技术方案。"],
    ["平台梳理AI需求", "形成相对清晰、可匹配、可验证的应用场景。"],
    ["AI能力与方案征集", "提交技术、产品、方案、成果与交付能力。"],
    ["测试验证与供需对接", "推动低成本验证、项目试点与人才推荐。"],
    ["形成持续成果", "促成订单、就业、创业与后续产业连接。"],
  ];
  return (
    <section className="page-section process-section">
      <SectionHeading kicker="FROM NEED TO VALUE" title="大会形成什么结果" />
      <p className="section-lead">大会的终点不是颁奖，而是推动优秀能力进入真实产业。</p>
      <div className="process-row">
        {steps.map(([title, text], index) => (
          <article key={title}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <h3>{title}</h3><p>{text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function SchedulePage({ openForm }) {
  const stages = [
    ["报名与材料提交", "填写基本信息，提交一份已有材料或作品链接，无需重新制作复杂材料。"],
    ["材料审核与初步沟通", "组委会审核报名信息，并根据需要联系参与者补充材料。"],
    ["入围选拔", "通过线上或线下形式介绍项目、成果与产业价值。"],
    ["企业需求匹配与产业实践", "安排企业需求、行业场景或合作资源对接，推动试点。"],
    ["大会展示与成果发布", "入围项目在大会现场展示、路演与交流。"],
    ["赛后持续连接", "进入 OPCWISE 持续连接体系，参与后续项目合作。"],
  ];
  return (
    <main className="page-main">
      <PageHero
        kicker="JOURNEY & GUIDELINES"
        title="赛程与参与说明"
        description="从报名征集到产业对接，让 AIGC 能力在真实场景中得到验证。具体日期与场地以组委会后续发布为准。"
        primary={<Button onClick={() => openForm("aigc")}>立即报名 <ArrowRight /></Button>}
      />
      <section className="page-section">
        <SectionHeading kicker="SIX STAGES" title="六个阶段" />
        <div className="timeline">
          {stages.map(([title, text], index) => (
            <article key={title}>
              <div className="timeline-index">{String(index + 1).padStart(2, "0")}</div>
              <div><h3>{title}</h3><p>{text}</p></div>
            </article>
          ))}
        </div>
      </section>
      <section className="page-section split-panels">
        <article className="info-panel">
          <CloudArrowUp />
          <h2>报名材料说明</h2>
          <ul>
            <li>可上传 1 份 PDF、PPT、PPTX 或 Word 材料，不超过 30MB。</li>
            <li>视频使用公开链接或网盘链接提交，最多填写 3 个相关链接。</li>
            <li>材料不足时，组委会将联系报名者补充。</li>
            <li>材料应尽量说明“你是谁、正在做什么、取得了什么进展”。</li>
          </ul>
        </article>
        <article className="info-panel evaluation-panel">
          <Target />
          <h2>主要评选方向</h2>
          <div className="mini-list">
            {evaluation.map(([title, text]) => <div key={title}><strong>{title}</strong><span>{text}</span></div>)}
          </div>
        </article>
      </section>
    </main>
  );
}

function EnterprisePage({ openForm }) {
  return (
    <main className="page-main">
      <PageHero
        kicker="ENTERPRISE AI NEEDS"
        title="发布企业 AI 需求"
        description="无需准备完整方案，也无需先判断应该使用哪种 AI 技术。只需告诉我们目前遇到的问题，后续由工作人员协助梳理并匹配合适的能力。"
        primary={<Button onClick={() => openForm("enterprise")}>提交企业需求 <ArrowRight /></Button>}
      />
      <section className="page-section">
        <SectionHeading kicker="WHAT YOU CAN SUBMIT" title="企业可以提交哪些需求" />
        <div className="category-grid">
          {enterpriseCategories.map(([title, text, Icon]) => (
            <article className="category-card" key={title}><Icon /><h3>{title}</h3><p>{text}</p></article>
          ))}
        </div>
        <div className="note-banner">
          <Sparkle />
          <p>暂时无法判断需求方向？只需描述业务问题，OPCWISE 将协助梳理并转化为可实施的 AI 需求。</p>
        </div>
      </section>
      <section className="page-section">
        <SectionHeading kicker="WHAT HAPPENS NEXT" title="提交后会发生什么" />
        <div className="process-row four">
          {[
            ["描述业务问题", "说明目前遇到什么问题、希望改善哪个环节或期待什么结果。"],
            ["梳理AI应用需求", "进一步了解场景、目标、数据基础与合作边界。"],
            ["匹配合适能力", "连接技术、产品、创业者、专业人才或科研力量。"],
            ["测试验证与落地", "推动方案沟通、低成本验证、项目试点与正式合作。"],
          ].map(([title, text], index) => (
            <article key={title}><span>0{index + 1}</span><h3>{title}</h3><p>{text}</p></article>
          ))}
        </div>
      </section>
      <section className="page-section demand-status">
        <div>
          <span className="eyebrow">OPEN CALL</span>
          <h2>企业需求持续征集中</h2>
          <p>首批企业需求正在审核与梳理中，经企业授权后，部分需求将在本页面公开发布。</p>
        </div>
        <Button onClick={() => openForm("enterprise")}>用 2—3 分钟提交需求 <ArrowRight /></Button>
      </section>
    </main>
  );
}

function AigcPage({ openForm }) {
  return (
    <main className="page-main">
      <PageHero
        kicker="AIGC INDUSTRY PRACTICE UNIT"
        title="AIGC 产业实践单元"
        description="不是只评一件作品，而是发现能够用 AIGC 进入产业、创造价值并形成创业或就业路径的人。"
        primary={<Button onClick={() => openForm("aigc")}>报名 AIGC 产业实践单元 <ArrowRight /></Button>}
      />
      <section className="page-section prose-section">
        <SectionHeading kicker="UNIT POSITIONING" title="从 AIGC 开始，但未来不止 AIGC" />
        <div className="two-column-copy">
          <p>
            作为大会首期启动单元，本单元围绕 AI 内容创作、影视、品牌、电商、IP 及数字创意等方向，
            面向使用 AIGC 开展企业服务、产品开发、项目创业和职业实践的个人与团队。
          </p>
          <p>
            作品可以作为能力证明，但画面、技术和审美效果不是唯一标准。
            我们更关注如何把 AIGC 能力转化为真实服务、商业项目、就业能力、创业产品和产业价值。
          </p>
        </div>
      </section>
      <section className="page-section">
        <SectionHeading kicker="PRACTICE DIRECTIONS" title="可以提交哪些方向" />
        <div className="direction-grid">
          {aigcDirections.map(([title, text, Icon]) => (
            <article key={title}><Icon /><div><h3>{title}</h3><p>{text}</p></div></article>
          ))}
        </div>
      </section>
      <section className="page-section split-panels">
        <article className="info-panel">
          <UserFocus />
          <h2>我们寻找什么样的人</h2>
          <ul>
            <li>已有 AIGC 作品，希望走向商业化。</li>
            <li>完成过企业付费项目，或正在形成持续接单能力。</li>
            <li>正在建立工作室、个人 OPC 或创业团队。</li>
            <li>正在寻找 AIGC 相关岗位或项目合作。</li>
            <li>希望把作品发展成 IP、产品或服务。</li>
          </ul>
        </article>
        <article className="info-panel">
          <Trophy />
          <h2>参与者有机会获得</h2>
          <ul>
            <li>大会展示与路演机会。</li>
            <li>企业需求、项目试点与商业订单对接。</li>
            <li>AIGC 岗位和人才推荐机会。</li>
            <li>创业导师、项目共创及产业资源连接。</li>
            <li>进入 OPCWISE 项目与人才连接体系。</li>
          </ul>
        </article>
      </section>
      <section className="page-section center-cta">
        <span className="eyebrow">READY TO BUILD REAL VALUE?</span>
        <h2>把你的 AIGC 能力带进真实产业</h2>
        <p>提交现有材料即可，无需重新制作大会专用模板。</p>
        <Button onClick={() => openForm("aigc")}>开始报名 <ArrowRight /></Button>
      </section>
    </main>
  );
}

function OpcwisePage({ openForm }) {
  return (
    <main className="page-main">
      <PageHero
        kicker="ABOUT OPCWISE"
        title="连接企业 AI 需求，发现 AI · OPC"
        description="从企业真实经营问题出发，连接适合的技术、产品、人才、创业团队与产业资源，推动 AI 解决方案从需求提出、测试验证走向项目落地。"
        primary={<Button onClick={() => document.getElementById("film")?.scrollIntoView({ behavior: "smooth" })}><Play /> 观看宣传片</Button>}
        secondary={<Button secondary onClick={() => openForm("aigc")}>加入 OPCWISE</Button>}
      />
      <section className="page-section prose-section">
        <SectionHeading kicker="WHAT IS OPCWISE" title="面向企业 AI 化与泛 AI 产业长期运营的连接平台" />
        <div className="two-column-copy">
          <p>
            我们帮助企业梳理 AI 应用场景，连接适合的技术、产品、人才和创业团队，
            让企业更容易找到真正适合自己的 AI 能力。
          </p>
          <p>
            我们也让更多 AI·OPC 创业者获得真实场景、客户、订单和持续发展的机会，
            推动需求从梳理、匹配和验证走向项目落地。
          </p>
        </div>
      </section>
      <section className="page-section">
        <SectionHeading kicker="THE CONNECTION CHAIN" title="OPCWISE 如何运转" />
        <div className="chain">
          {["发现企业问题", "梳理AI需求", "征集解决方案", "匹配AI·OPC", "开展测试验证", "推动项目落地", "形成长期服务"].map((item, index) => (
            <div key={item}><span>{index + 1}</span><strong>{item}</strong>{index < 6 && <ArrowRight />}</div>
          ))}
        </div>
      </section>
      <section className="page-section">
        <SectionHeading kicker="WHAT WE CONNECT" title="我们连接什么" />
        <div className="reason-grid">
          {[
            ["连接企业问题与需求", "汇集经营、管理、生产、服务、增长和创新中的真实问题。"],
            ["连接AI技术与人才", "发现具备技术开发、产品创新和商业交付能力的 AI·OPC。"],
            ["连接项目与合作", "促成诊断、测试、订单、人才就业、产品合作和联合创新。"],
            ["连接产业资源", "连接高校科研、园区政府、导师专家及创业服务资源。"],
          ].map(([title, text], index) => (
            <article className="reason-card" key={title}><span>0{index + 1}</span><h3>{title}</h3><p>{text}</p></article>
          ))}
        </div>
      </section>
      <section id="film" className="page-section film-panel">
        <div className="film-visual">
          <img src="/assets/conference-stage.jpg" alt="OPCWISE 宣传片画面预览" />
          <button aria-label="播放宣传片预览"><Play weight="fill" /></button>
        </div>
        <div>
          <span className="eyebrow">60—90s BRAND FILM</span>
          <h2>为什么需要 OPCWISE</h2>
          <p>企业有真实问题，却难以形成清晰的 AI 需求；AI 创业者拥有能力，却缺少场景、客户和持续订单。</p>
          <p className="muted">正式宣传片素材接入后，此区域可直接替换为视频播放器。</p>
        </div>
      </section>
    </main>
  );
}

function ShortFilmPage() {
  return (
    <main className="page-main">
      <PageHero
        kicker="ONE-MINUTE SHORT FILM COMPETITION"
        title="一分钟短片创作大赛"
        description="用一分钟的影像，讲述你的创意。参赛作品版权及使用授权说明。"
        visual="one-minute.jpg"
        primary={<Button onClick={() => go("short-film/upload")}><CloudArrowUp /> 上传作品 <ArrowRight weight="bold" /></Button>}
      />
      <section className="page-section prose-section">
        <SectionHeading kicker="COPYRIGHT & USAGE RIGHTS" title="参赛作品版权及使用授权" />
        <div className="legal-copy">
          <p>作品著作权归创作者所有。自作品提交之日起，参赛者同意授予迈影公司永久、全球范围内、无偿、非独占的作品使用权。</p>
          <p>迈影公司有权通过互联网平台、社交媒体、视频网站、官方网站、媒体报道、线下活动、展览、发布会及其他公开渠道，对全部参赛作品进行发布、传播、展示、放映和宣传。</p>
          <p>为适应宣传、展示及不同平台的传播要求，迈影公司有权在不歪曲作品原意、不损害创作者合法权益的前提下，对参赛作品进行剪辑、节选、压缩、格式转换、添加字幕、增加片头片尾、制作宣传片段及其他必要编辑。</p>
        </div>
        <div className="upload-section-cta">
          <Button onClick={() => go("short-film/upload")}><CloudArrowUp /> 上传你的作品 <ArrowRight /></Button>
        </div>
      </section>
    </main>
  );
}

function ShortFilmUploadPage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [wechat, setWechat] = useState("");
  const [workTitle, setWorkTitle] = useState("");
  const [intro, setIntro] = useState("");
  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadState, setUploadState] = useState({ status: 'idle', progress: 0, fileName: '', error: '' });
  const [link, setLink] = useState("");
  const [linkStatus, setLinkStatus] = useState('idle'); // idle | validating | valid | invalid
  const [linkError, setLinkError] = useState("");
  const [linkId, setLinkId] = useState(0);
  const [agreed, setAgreed] = useState(false);
  const uploadXhr = useRef(null);

  function handleFile(event) {
    const next = event.target.files?.[0] || null;
    if (!next) return setFile(null);
    const ext = next.name.slice(next.name.lastIndexOf(".")).toLowerCase();
    if (![".jpg", ".jpeg", ".png", ".webp", ".pdf", ".mp4", ".mov", ".avi", ".zip"].includes(ext) || next.size > 50 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, file: "支持 JPG/PNG/WebP/PDF/MP4/MOV/AVI/ZIP，不超过 50MB" }));
      event.target.value = "";
      return setFile(null);
    }
    setErrors((prev) => ({ ...prev, file: "" }));
    setFile(next);
    setLink("");
    setLinkStatus('idle');
    setLinkError("");
    startUpload(next);
  }

  async function startUpload(file) {
    const prev = uploadXhr.current;
    uploadXhr.current = null;
    if (prev) prev.abort();
    setUploadState({ status: 'reading', progress: 0, fileName: '', error: '' });
    try {
      const data = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(",")[1]);
        reader.onerror = () => reject(new Error("文件读取失败"));
        reader.readAsDataURL(file);
      });
      setUploadState((prev) => ({ ...prev, status: 'uploading' }));
      await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        uploadXhr.current = xhr;
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) setUploadState((prev) => ({ ...prev, progress: Math.round((e.loaded / e.total) * 100) }));
        };
        xhr.onload = () => {
          if (uploadXhr.current !== xhr) return;
          if (xhr.status === 200) {
            const res = JSON.parse(xhr.responseText);
            setUploadState({ status: 'done', progress: 100, fileName: res.path, error: '' });
            resolve();
          } else {
            let msg = "文件上传失败";
            try { const err = JSON.parse(xhr.responseText); if (err.error) msg = err.error; } catch {}
            setUploadState({ status: 'error', progress: 0, fileName: '', error: msg });
            reject(new Error(msg));
          }
        };
        xhr.onerror = () => {
          if (uploadXhr.current !== xhr) return;
          setUploadState({ status: 'error', progress: 0, fileName: '', error: "无法连接服务器，请确认后端服务已启动" });
          reject(new Error("网络错误"));
        };
        xhr.onabort = () => {
          if (uploadXhr.current === xhr) {
            setUploadState({ status: 'idle', progress: 0, fileName: '', error: '' });
            uploadXhr.current = null;
          }
        };
        xhr.open("POST", "/api/upload");
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.send(JSON.stringify({ name: file.name, data }));
      });
    } catch (err) {
      if (!uploadXhr.current) return;
      if (err.message === "网络错误") return;
      setUploadState({ status: 'error', progress: 0, fileName: '', error: err.message || "文件上传失败" });
    }
  }

  function handleLinkChange(value) {
    setLink(value);
    setLinkStatus(value ? 'idle' : 'idle');
    setLinkError("");
    setErrors((prev) => ({ ...prev, file: "" }));
  }

  async function handleValidateLink() {
    if (!link.trim()) return;
    setLinkStatus('validating');
    setLinkError("");
    try {
      const res = await fetch("/api/validate-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: link.trim() }),
      });
      const data = await res.json();
      if (data.valid) {
        setLinkStatus('valid');
        setLinkId((prev) => prev + 1);
        setFile(null);
      } else {
        setLinkStatus('invalid');
        setLinkError(data.error || "链接无效");
      }
    } catch (err) {
      setLinkStatus('invalid');
      setLinkError("无法连接服务器，请稍后重试");
    }
  }

  function validate() {
    const next = {};
    if (!name.trim()) next.name = "请填写姓名";
    if (!/^1[3-9]\d{9}$/.test(phone)) next.phone = "请输入有效的手机号";
    if (!wechat.trim()) next.wechat = "请填写微信号";
    if (!workTitle.trim()) next.workTitle = "请填写作品名称";
    if (!intro.trim()) next.intro = "请填写作品简介";
    if (intro.length > 200) next.intro = "简介不超过 200 字";
    if (intro.length > 0 && intro.length <= 200 && !intro.trim()) next.intro = "请填写作品简介";
    const hasFile = !!(file && uploadState.status === 'done');
    const hasLink = linkStatus === 'valid';
    if (!hasFile && !hasLink) next.file = "请上传作品文件或填写作品链接";
    if (file && uploadState.status === 'error') next.file = "文件上传失败，请重新选择文件";
    if (!agreed) next.agreed = "请阅读并同意版权条款";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function submit(event) {
    event.preventDefault();
    if (!validate()) return;
    if (uploadState.status === 'uploading' || uploadState.status === 'reading') {
      setErrors((prev) => ({ ...prev, _form: "文件上传中，请稍后..." }));
      return;
    }
    if (linkStatus === 'validating') {
      setErrors((prev) => ({ ...prev, _form: "链接验证中，请稍后..." }));
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "short-film", name: name.trim(), phone, wechat: wechat.trim(),
          workTitle: workTitle.trim(), intro: intro.trim(),
          fileName: uploadState.fileName || "",
          fileLink: linkStatus === 'valid' ? link.trim() : "",
        }),
      });
      if (!res.ok) {
        let msg;
        try { const err = await res.json(); if (err.error) msg = err.error; } catch { msg = `提交失败（${res.status}），请稍后重试`; }
        throw new Error(msg);
      }
      const data = await res.json();
      setSuccess(data.id);
    } catch (err) {
      const msg = err.message.includes("Failed to fetch") || err.message.includes("NetworkError")
        ? "无法连接服务器，请确认后端服务已启动"
        : err.message;
      setErrors((prev) => ({ ...prev, _form: msg }));
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <main className="page-main">
        <section className="page-section success-section">
          <div className="success-card">
            <Check weight="bold" />
            <h2>作品上传成功</h2>
            <p>您的作品已提交，编号：<strong>{success}</strong></p>
            <p>请扫描下方二维码加入企业微信群，获取大赛后续通知与交流机会。</p>
            <img className="qrcode-img" src="/assets/weixin.png" alt="企业微信群二维码" />
            <p className="muted">如二维码过期，请联系组委会工作人员</p>
            <Button onClick={() => go("home")}>返回首页 <ArrowRight /></Button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="page-main">
      <PageHero
        kicker="SUBMIT YOUR WORK"
        title="上传作品"
        description="一分钟短片创作大赛 · 作品提交通道"
        visual="one-minute.jpg"
      />
      <section className="page-section form-section">
        <form className="upload-form" onSubmit={submit} noValidate>
          <TextField label="姓名" required value={name} error={errors.name} onChange={setName} placeholder="您的姓名或团队名称" />
          <TextField label="手机号" required type="tel" value={phone} error={errors.phone} onChange={setPhone} placeholder="11 位手机号" />
          <TextField label="微信号" required value={wechat} error={errors.wechat} onChange={setWechat} placeholder="您的微信号" />
          <TextField label="作品名称" required value={workTitle} error={errors.workTitle} onChange={setWorkTitle} placeholder="您的作品名称" />
          <TextareaField label="作品简介" required value={intro} error={errors.intro} maxLength={200} onChange={setIntro} placeholder="请用 200 字以内描述您的作品内容、创作思路与亮点。" />
          <fieldset className={`material-field ${errors.file ? "has-error" : ""}`}>
            <legend>作品文件 <b>*</b></legend>
            <div className="material-grid">
              <label className={`upload-box ${linkStatus === 'valid' ? 'disabled' : ''}`}>
                {uploadState.status === 'reading' ? (
                  <><strong>正在读取文件...</strong></>
                ) : uploadState.status === 'uploading' ? (
                  <>
                    <div className="upload-progress-bar"><div className="upload-progress-fill" style={{ width: uploadState.progress + '%' }} /></div>
                    <strong className="upload-status-uploading">上传中 {uploadState.progress}%</strong>
                  </>
                ) : uploadState.status === 'done' ? (
                  <>
                    <Check weight="bold" />
                    <strong>{file ? file.name : "文件已上传"}</strong>
                    <span className="upload-status-done">上传成功</span>
                  </>
                ) : uploadState.status === 'error' ? (
                  <>
                    <CloudArrowUp />
                    <strong>上传失败，点击重试</strong>
                    <span className="upload-status-error">{uploadState.error}</span>
                  </>
                ) : (
                  <>
                    <CloudArrowUp />
                    <strong>上传作品文件</strong>
                    <span>JPG / PNG / WebP / PDF / MP4 / MOV / AVI / ZIP · 不超过 50MB</span>
                  </>
                )}
                <input type="file" accept=".jpg,.jpeg,.png,.webp,.pdf,.mp4,.mov,.avi,.zip" onChange={handleFile} disabled={linkStatus === 'valid'} />
              </label>
              <div className="link-box">
                <span>或提供作品在线网盘链接</span>
                <div className="link-input-row">
                  <input type="url" className="link-input" value={link} onChange={(e) => handleLinkChange(e.target.value)} placeholder="https://..." disabled={uploadState.status === 'done' || uploadState.status === 'uploading' || uploadState.status === 'reading'} />
                  <button type="button" className="link-validate-btn" onClick={handleValidateLink} disabled={!link.trim() || linkStatus === 'validating' || uploadState.status === 'done' || uploadState.status === 'uploading' || uploadState.status === 'reading'}>
                    {linkStatus === 'validating' ? '验证中...' : '验证链接'}
                  </button>
                </div>
                {linkStatus === 'valid' && <span className="link-status-valid"><Check weight="bold" /> 链接已验证</span>}
                {linkStatus === 'invalid' && <span className="link-status-invalid">链接无效：{linkError}</span>}
                {linkStatus === 'idle' && link && <span className="link-status-idle">请点击"验证链接"确认链接可访问</span>}
              </div>
            </div>
            {errors.file && <small>{errors.file}</small>}
          </fieldset>
          <label className={`copyright-agreement ${errors.agreed ? "has-error" : ""}`}>
            <input type="checkbox" checked={agreed} onChange={(e) => { setAgreed(e.target.checked); setErrors((prev) => ({ ...prev, agreed: "" })); }} />
            <div>
              <strong>参赛作品版权及使用授权</strong>
              <ol>
                <li>作品著作权归创作者所有。自作品提交之日起，参赛者同意授予迈影公司永久、全球范围内、无偿、非独占的作品使用权。</li>
                <li>迈影公司有权通过互联网平台、社交媒体、视频网站、官方网站、媒体报道、线下活动展览、发布会及其他公开渠道，对全部参赛作品进行发布、传播、展示、放映和宣传。</li>
                <li>为适应宣传、展示及不同平台的传播要求，迈影公司有权在不歪曲作品原意、不损害创作者合法权益的前提下，对参赛作品进行剪辑、节选、压缩、格式转换、添加字幕、增加片头片尾、制作宣传片段及其他必要编辑。</li>
              </ol>
              <span>我已阅读并同意以上条款 <b>*</b></span>
            </div>
            {errors.agreed && <small>请阅读并同意版权条款</small>}
          </label>
          {errors._form && <div className="error-banner">{errors._form}</div>}
          <button className="button submit-button" type="submit" disabled={submitting || !agreed || linkStatus === 'validating'}>
            {submitting ? "提交中..." : "提交作品"} <ArrowRight weight="bold" />
          </button>
        </form>
      </section>
    </main>
  );
}

const industryOptions = ["互联网/软件", "文化传媒", "消费零售", "制造业", "金融", "教育", "医疗健康", "文旅", "政府/园区", "其他"];
const cityOptions = ["北京", "上海", "广州", "深圳", "杭州", "南京", "成都", "武汉", "西安", "其他"];
const enterpriseNeeds = ["品牌宣传与广告", "短视频及账号内容", "产品展示与电商内容", "AI短剧、漫剧或影视内容", "数字人及虚拟IP", "文旅、园区及城市宣传", "企业培训及内部传播", "暂不确定，希望获得建议", "其他"];
const cooperationOptions = ["有明确项目，希望尽快对接", "有初步需求，希望获得方案", "希望先做低成本测试", "希望作为大会命题或合作项目", "暂时了解AIGC能为企业做什么"];
const identityOptions = ["独立AIGC创作者", "AI·OPC创业者", "自由职业者", "工作室/创业团队", "企业从业者", "高校学生/教师", "正在转型进入AIGC行业", "其他"];
const pathOptions = ["成立或发展自己的AI·OPC", "承接企业项目和商业订单", "成为自由职业创作者", "寻找AIGC相关工作", "寻找项目合伙人", "将作品发展成IP或产品", "获得企业命题及合作机会", "尚未明确，希望获得指导"];
const stageOptions = ["正在学习尝试，尚无完整项目", "已有作品，尚未获得收入", "已完成付费项目", "已有持续接单或合作客户", "已形成工作室、团队或OPC", "已有标准化产品或稳定商业模式", "已进入企业任职或参与企业项目"];
const creatorDirections = ["AI影视/短片", "AI短剧/漫剧", "AI广告及品牌内容", "AI短视频及账号运营", "AI数字人", "AI电商及产品内容", "AI文旅内容", "AI动画及视觉设计", "AI音乐/MV", "其他"];

function FormModal({ type, onClose }) {
  const isEnterprise = type === "enterprise";
  const initial = useMemo(() => isEnterprise ? {
    organization: "", industry: "", city: "", contact: "", phone: "", wechat: "",
    needs: [], description: "", cooperation: "", materialLink: "",
  } : {
    name: "", city: "", phone: "", wechat: "", identity: "", paths: [],
    stage: "", directions: [], intro: "", materialLinks: "",
  }, [isEnterprise]);
  const [values, setValues] = useState(initial);
  const [file, setFile] = useState(null);
  const [uploadState, setUploadState] = useState({ status: 'idle', progress: 0, fileName: '', error: '' });
  const uploadXhr = useRef(null);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(null);
  const [duplicate, setDuplicate] = useState(false);

  useEffect(() => {
    const onKey = (event) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.classList.add("modal-open");
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.classList.remove("modal-open");
    };
  }, [onClose]);

  function update(key, value) {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: "" }));
  }

  function toggle(key, value) {
    const current = values[key];
    update(key, current.includes(value) ? current.filter((item) => item !== value) : [...current, value]);
  }

  function handleFile(event) {
    const next = event.target.files?.[0] || null;
    if (!next) return setFile(null);
    const allowed = [".jpg", ".jpeg", ".png", ".webp", ".pdf"];
    const extension = next.name.slice(next.name.lastIndexOf(".")).toLowerCase();
    if (!allowed.includes(extension) || next.size > 10 * 1024 * 1024) {
      setErrors((current) => ({ ...current, file: `仅支持 JPG/PNG/WebP 图片或 PDF 文件，不超过 10MB。` }));
      event.target.value = "";
      return setFile(null);
    }
    setErrors((current) => ({ ...current, file: "" }));
    setFile(next);
    startUpload(next);
  }

  async function startUpload(file) {
    const prev = uploadXhr.current;
    uploadXhr.current = null;
    if (prev) prev.abort();
    setUploadState({ status: 'reading', progress: 0, fileName: '', error: '' });
    try {
      const data = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(",")[1]);
        reader.onerror = () => reject(new Error("文件读取失败"));
        reader.readAsDataURL(file);
      });
      setUploadState((prev) => ({ ...prev, status: 'uploading' }));
      await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        uploadXhr.current = xhr;
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) setUploadState((prev) => ({ ...prev, progress: Math.round((e.loaded / e.total) * 100) }));
        };
        xhr.onload = () => {
          if (uploadXhr.current !== xhr) return;
          if (xhr.status === 200) {
            const res = JSON.parse(xhr.responseText);
            setUploadState({ status: 'done', progress: 100, fileName: res.path, error: '' });
            resolve();
          } else {
            let msg = "文件上传失败";
            try { const err = JSON.parse(xhr.responseText); if (err.error) msg = err.error; } catch {}
            setUploadState({ status: 'error', progress: 0, fileName: '', error: msg });
            reject(new Error(msg));
          }
        };
        xhr.onerror = () => {
          if (uploadXhr.current !== xhr) return;
          setUploadState({ status: 'error', progress: 0, fileName: '', error: "无法连接服务器，请确认后端服务已启动" });
          reject(new Error("网络错误"));
        };
        xhr.onabort = () => {
          if (uploadXhr.current === xhr) {
            setUploadState({ status: 'idle', progress: 0, fileName: '', error: '' });
            uploadXhr.current = null;
          }
        };
        xhr.open("POST", "/api/upload");
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.send(JSON.stringify({ name: file.name, data }));
      });
    } catch (err) {
      if (!uploadXhr.current) return;
      if (err.message === "网络错误") return;
      setUploadState({ status: 'error', progress: 0, fileName: '', error: err.message || "文件上传失败" });
    }
  }

  function validate() {
    const next = {};
    const required = isEnterprise
      ? ["organization", "industry", "city", "contact", "phone", "needs", "description", "cooperation"]
      : ["name", "city", "phone", "wechat", "identity", "paths", "stage", "directions", "intro"];
    required.forEach((key) => {
      if (!values[key] || values[key].length === 0) next[key] = "请完成此项";
    });
    if (values.phone && !/^1[3-9]\d{9}$/.test(values.phone)) next.phone = "请输入有效的中国大陆手机号";
    if (isEnterprise && values.description.length > 100) next.description = "需求描述请控制在 100 字以内";
    if (!isEnterprise && values.intro.length > 300) next.intro = "一句话介绍请控制在 300 字以内";
    if (!isEnterprise && !file && !uploadState.fileName && !values.materialLinks.trim()) next.materials = "请上传一份材料，或填写至少一个材料链接";
    if (!isEnterprise && file && uploadState.status === 'error') next.file = "文件上传失败，请重新选择文件";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function submit(event) {
    event.preventDefault();
    if (!validate()) return;
    if (uploadState.status === 'uploading' || uploadState.status === 'reading') {
      setErrors((current) => ({ ...current, _form: "文件上传中，请稍后..." }));
      return;
    }
    try {
      const body = { type, phone: values.phone, fileName: uploadState.fileName || "", ...values };
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        let msg;
        try { const err = await res.json(); if (err.error) msg = err.error; } catch { msg = `提交失败（${res.status}），请稍后重试`; }
        throw new Error(msg);
      }
      const data = await res.json();
      setDuplicate(data.duplicate);
      setSuccess(data.id);
    } catch (err) {
      const msg = err.message.includes("Failed to fetch") || err.message.includes("NetworkError")
        ? "无法连接服务器，请确认后端服务已启动"
        : err.message;
      setErrors((current) => ({ ...current, _form: msg }));
    }
  }

  if (success) {
    return (
      <div className="modal-backdrop form-backdrop" role="presentation">
        <section className="success-modal" role="dialog" aria-modal="true" aria-labelledby="success-title">
          <div className="success-icon"><Check weight="bold" /></div>
          <span className="eyebrow">SUBMISSION RECEIVED</span>
          <h2 id="success-title">提交成功</h2>
          <p>您的{isEnterprise ? "企业需求" : "报名信息"}已生成编号：</p>
          <strong className="submission-id">{success}</strong>
          <p className="muted">请保存该编号。组委会工作人员将在审核后与您联系。</p>
          <Button onClick={onClose}>完成</Button>
        </section>
      </div>
    );
  }

  return (
    <div className="modal-backdrop form-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="form-modal" role="dialog" aria-modal="true" aria-labelledby="form-title" onMouseDown={(event) => event.stopPropagation()}>
        <div className="form-header">
          <div>
            <span className="eyebrow">{isEnterprise ? "ENTERPRISE NEEDS" : "AIGC PRACTICE UNIT"}</span>
            <h2 id="form-title">{isEnterprise ? "企业 AI 需求表" : "AIGC 产业实践单元报名表"}</h2>
            <p>{isEnterprise ? "仅需填写基本需求，预计 2—3 分钟完成。" : "提交基本情况与现有材料，预计 3—5 分钟完成。"}</p>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="关闭"><X /></button>
        </div>
        <form onSubmit={submit} noValidate>
          {isEnterprise ? (
            <>
              <div className="form-grid">
                <TextField label="企业/机构名称" required value={values.organization} error={errors.organization} onChange={(value) => update("organization", value)} maxLength={100} />
                <SelectField label="所属行业" required value={values.industry} error={errors.industry} options={industryOptions} onChange={(value) => update("industry", value)} />
                <SelectField label="所在城市" required value={values.city} error={errors.city} options={cityOptions} onChange={(value) => update("city", value)} />
                <TextField label="联系人" required value={values.contact} error={errors.contact} onChange={(value) => update("contact", value)} />
                <TextField label="手机号" required type="tel" value={values.phone} error={errors.phone} onChange={(value) => update("phone", value)} placeholder="11位手机号" />
                <TextField label="微信号" value={values.wechat} onChange={(value) => update("wechat", value)} />
              </div>
              {duplicate && <div className="duplicate-note">该手机号已有提交记录，您仍可继续提交本次新需求。</div>}
              <CheckboxGroup label="希望解决哪类问题" required options={enterpriseNeeds} values={values.needs} error={errors.needs} onToggle={(value) => toggle("needs", value)} />
              <TextareaField label="简单描述需求" required value={values.description} error={errors.description} maxLength={100} onChange={(value) => update("description", value)} placeholder="请说明目前遇到的问题、希望改善的业务环节或期待的结果。" />
              <RadioGroup label="当前合作意向" required options={cooperationOptions} value={values.cooperation} error={errors.cooperation} onChange={(value) => update("cooperation", value)} />
              <MaterialField value={values.materialLink} onChange={(value) => update("materialLink", value)} file={file} error={errors.file} onFile={handleFile} required={false} uploadState={uploadState} />
            </>
          ) : (
            <>
              <div className="form-grid">
                <TextField label="姓名/团队名称" required value={values.name} error={errors.name} onChange={(value) => update("name", value)} />
                <SelectField label="所在城市" required value={values.city} error={errors.city} options={cityOptions} onChange={(value) => update("city", value)} />
                <TextField label="手机号" required type="tel" value={values.phone} error={errors.phone} onChange={(value) => update("phone", value)} placeholder="11位手机号" />
                <TextField label="微信号" required value={values.wechat} error={errors.wechat} onChange={(value) => update("wechat", value)} />
              </div>
              {duplicate && <div className="duplicate-note">该手机号已有报名记录，您仍可继续提交本次更新。</div>}
              <RadioGroup label="当前身份" required options={identityOptions} value={values.identity} error={errors.identity} onChange={(value) => update("identity", value)} />
              <CheckboxGroup label="希望发展的路径" required options={pathOptions} values={values.paths} error={errors.paths} onToggle={(value) => toggle("paths", value)} />
              <RadioGroup label="目前达到的阶段" required options={stageOptions} value={values.stage} error={errors.stage} onChange={(value) => update("stage", value)} />
              <CheckboxGroup label="主要 AIGC 方向" required options={creatorDirections} values={values.directions} error={errors.directions} onToggle={(value) => toggle("directions", value)} />
              <TextareaField label="一句话介绍" required value={values.intro} error={errors.intro} maxLength={300} onChange={(value) => update("intro", value)} placeholder="说明你是谁、正在做什么、已有成果以及下一步希望获得什么资源。" />
              <MaterialField value={values.materialLinks} onChange={(value) => update("materialLinks", value)} file={file} error={errors.file || errors.materials} onFile={handleFile} required uploadState={uploadState} />
            </>
          )}
          <div className="form-footer">
            <p>提交即表示您同意组委会为报名审核与项目对接使用上述信息。联系方式及未授权材料不会公开展示。</p>
            {errors._form && <div className="error-banner">{errors._form}</div>}
            <Button className="submit-button">{isEnterprise ? "提交企业需求" : "提交报名"} <ArrowRight /></Button>
          </div>
        </form>
      </section>
    </div>
  );
}

function FieldWrap({ label, required, error, children, className = "" }) {
  return (
    <label className={`field ${error ? "has-error" : ""} ${className}`}>
      <span>{label}{required && <b> *</b>}</span>
      {children}
      {error && <small>{error}</small>}
    </label>
  );
}

function TextField({ label, required, value, error, onChange, type = "text", ...props }) {
  return <FieldWrap label={label} required={required} error={error}><input type={type} value={value} onChange={(event) => onChange(event.target.value)} {...props} /></FieldWrap>;
}

function SelectField({ label, required, value, error, options, onChange }) {
  return (
    <FieldWrap label={label} required={required} error={error}>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="">请选择</option>{options.map((option) => <option key={option}>{option}</option>)}
      </select>
    </FieldWrap>
  );
}

function TextareaField({ label, required, value, error, onChange, maxLength, placeholder }) {
  return (
    <FieldWrap label={label} required={required} error={error} className="field-block">
      <textarea value={value} onChange={(event) => onChange(event.target.value)} maxLength={maxLength} placeholder={placeholder} />
      <em>{value.length}/{maxLength}</em>
    </FieldWrap>
  );
}

function CheckboxGroup({ label, required, options, values, error, onToggle }) {
  return (
    <fieldset className={`option-group ${error ? "has-error" : ""}`}>
      <legend>{label}{required && <b> *</b>}</legend>
      <div className="option-grid">
        {options.map((option) => (
          <label key={option} className={values.includes(option) ? "selected" : ""}>
            <input type="checkbox" checked={values.includes(option)} onChange={() => onToggle(option)} />
            <span>{values.includes(option) && <Check weight="bold" />}</span>{option}
          </label>
        ))}
      </div>
      {error && <small>{error}</small>}
    </fieldset>
  );
}

function RadioGroup({ label, required, options, value, error, onChange }) {
  return (
    <fieldset className={`option-group ${error ? "has-error" : ""}`}>
      <legend>{label}{required && <b> *</b>}</legend>
      <div className="option-grid">
        {options.map((option) => (
          <label key={option} className={value === option ? "selected" : ""}>
            <input type="radio" checked={value === option} onChange={() => onChange(option)} />
            <span>{value === option && <Check weight="bold" />}</span>{option}
          </label>
        ))}
      </div>
      {error && <small>{error}</small>}
    </fieldset>
  );
}

function MaterialField({ value, onChange, file, error, onFile, max, required, uploadState }) {
  return (
    <fieldset className={`material-field ${error ? "has-error" : ""}`}>
      <legend>现有材料{required && <b> *</b>}</legend>
      <div className="material-grid">
        <label className="upload-box">
          {uploadState && uploadState.status !== 'idle' ? (
            <>
              {uploadState.status === 'reading' ? (
                <><strong>正在读取文件...</strong></>
              ) : uploadState.status === 'uploading' ? (
                <>
                  <div className="upload-progress-bar"><div className="upload-progress-fill" style={{ width: uploadState.progress + '%' }} /></div>
                  <strong className="upload-status-uploading">上传中 {uploadState.progress}%</strong>
                </>
              ) : uploadState.status === 'done' ? (
                <>
                  <Check weight="bold" />
                  <strong>{file ? file.name : "材料已上传"}</strong>
                  <span className="upload-status-done">上传成功</span>
                </>
              ) : (
                <>
                  <CloudArrowUp />
                  <strong>上传失败，点击重试</strong>
                  <span className="upload-status-error">{uploadState.error}</span>
                </>
              )}
            </>
          ) : (
            <>
              <CloudArrowUp />
              <strong>{file ? file.name : "上传 1 份材料"}</strong>
              <span>JPG / PNG / WebP / PDF · 不超过{max ? max + "MB" : "10MB"}</span>
            </>
          )}
          <input type="file" accept=".jpg,.jpeg,.png,.webp,.pdf" onChange={onFile} />
        </label>
        <label className="link-box">
          <span>或填写作品集、网盘、官网、账号或案例链接</span>
          <textarea value={value} onChange={(event) => onChange(event.target.value)} placeholder={required ? "最多填写 3 个链接，每行一个" : "填写 1 个相关链接（选填）"} />
        </label>
      </div>
      {error && <small>{error}</small>}
    </fieldset>
  );
}

function Footer({ onRegister }) {
  return (
    <footer className="site-footer">
      <div className="footer-main">
        <div><Brand /><p>连接企业 AI 需求，发现 AI·OPC，推动 AI 能力进入真实产业。</p></div>
        <div className="footer-links">
          <strong>快速导航</strong>
          {NAV_ITEMS.slice(1).map(([label, key]) => <button key={key} onClick={() => go(key)}>{label}</button>)}
        </div>
        <div className="footer-cta">
          <strong>参与首期实践单元</strong>
          <p>具体日期、场地与组织单位信息以组委会后续发布为准。</p>
          <Button onClick={onRegister}>立即报名 <ArrowRight /></Button>
        </div>
      </div>
      <div className="footer-bottom"><span>© 2026 OPCWISE. All rights reserved.</span><span>AI · OPC 创业者大会</span></div>
    </footer>
  );
}

export function App() {
  const route = useHashRoute();
  const [chooser, setChooser] = useState(false);
  const [formType, setFormType] = useState(null);
  const openForm = (type) => {
    setChooser(false);
    setFormType(type);
  };

  const isUpload = route === "short-film/upload";
  useEffect(() => {
    const label = isUpload ? "上传作品" : NAV_ITEMS.find((item) => item[1] === route)?.[0] || "首页";
    document.title = `${label} | OPCWISE`;
  }, [route, isUpload]);

  let page;
  const isAdmin = route === "admin";
  if (isAdmin) page = <AdminPage />;
  else if (isUpload) page = <ShortFilmUploadPage />;
  else if (route === "about") page = <AboutPage openForm={openForm} />;
  else if (route === "schedule") page = <SchedulePage openForm={openForm} />;
  else if (route === "enterprise") page = <EnterprisePage openForm={openForm} />;
  else if (route === "aigc") page = <AigcPage openForm={openForm} />;
  else if (route === "short-film") page = <ShortFilmPage />;
  else if (route === "opcwise") page = <OpcwisePage openForm={openForm} />;
  else page = <HomePage onRegister={() => setChooser(true)} />;

  return (
    <div className="app-shell">
      {!isAdmin && <Header route={route} onRegister={() => setChooser(true)} />}
      {page}
      {!isAdmin && <Footer onRegister={() => setChooser(true)} />}
      {chooser && <RegistrationChooser onClose={() => setChooser(false)} onChoose={openForm} />}
      {formType && <FormModal type={formType} onClose={() => setFormType(null)} />}
    </div>
  );
}
