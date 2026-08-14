"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { articles } from "../src/data/articles";
import { lawyers } from "../src/data/lawyers";
import { practiceAreas } from "../src/data/practiceAreas";
import { siteConfig } from "../src/config/site";
import { sendContact } from "../src/services/contact";

const Arrow = () => <span aria-hidden="true">↗</span>;

function Logo({ light = false }: { light?: boolean }) {
  return <img className={`logo ${light ? "logo-light" : ""}`} src="/srv-logo.png" alt="Salomão Rezende Veloso Advocacia" />;
}

function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll(); window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const links = [["Escritório", "/#escritorio"], ["Atuação", "/atuacao"], ["Profissionais", "/advogados"], ["Publicações", "/artigos"], ["Contato", "/contato"]];
  return <>
    <header className={`header ${scrolled ? "is-scrolled" : ""}`}>
      <a href="/" aria-label="Página inicial"><Logo /></a>
      <nav className="desktop-nav" aria-label="Navegação principal">{links.map(([n, h]) => <a key={n} href={h}>{n}</a>)}</nav>
      <a className="header-cta" href="/contato">Fale conosco <Arrow /></a>
      <button className="menu-button" onClick={() => setOpen(!open)} aria-expanded={open} aria-label={open ? "Fechar menu" : "Abrir menu"}><span /><span /></button>
    </header>
    <div className={`mobile-menu ${open ? "open" : ""}`} aria-hidden={!open}>
      <Logo light />
      <nav>{links.map(([n, h]) => <a key={n} href={h} onClick={() => setOpen(false)}>{n}<Arrow /></a>)}</nav>
      <p>{siteConfig.email}<br />{siteConfig.phone}</p>
    </div>
  </>;
}

function Footer() {
  return <footer className="footer">
    <div className="footer-top"><Logo light /><p>Direito em movimento.<br />Estratégia para decisões relevantes.</p></div>
    <div className="footer-grid">
      <div><small>Navegação</small><a href="/#escritorio">Escritório</a><a href="/atuacao">Atuação</a><a href="/advogados">Profissionais</a><a href="/artigos">Publicações</a></div>
      <div><small>Contato</small><a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a><a href={`tel:${siteConfig.phone}`}>{siteConfig.phone}</a><span>{siteConfig.address}</span></div>
      <div><small>Institucional</small><a href="/privacidade">Privacidade</a><a href="/termos">Termos de uso</a><a href="#">LinkedIn</a><a href="#">Instagram</a></div>
    </div>
    <div className="marquee" aria-hidden="true"><div>ADVOCACIA · ESTRATÉGIA · NEGÓCIOS · SOCIEDADE · ADVOCACIA · ESTRATÉGIA · NEGÓCIOS · SOCIEDADE ·</div></div>
    <div className="footer-bottom"><span>© 2026 SRV Advocacia</span><span>Brasília · Brasil</span></div>
  </footer>;
}

function Home() {
  const [area, setArea] = useState(0);
  return <main>
    <section className="hero">
      <div className="hero-copy"><p className="hero-kicker">Advocacia estratégica · Brasília</p><h1>Estratégia jurídica<br />para um mundo em<br /><em>movimento.</em></h1><div className="hero-meta"><span>Sede em Brasília</span><span>Atuação nacional</span></div></div>
      <div className="hero-visual"><div className="hero-image" /><div className="hero-line" /><p>Visão de contexto.<br />Profundidade técnica.</p></div>
      <a className="scroll-note" href="#escritorio">Descubra <span>↓</span></a>
    </section>

    <section className="statement section" id="escritorio"><div className="statement-mark">SRV</div><p>Direito não acontece isolado.</p><h2>Ele acompanha negócios,<br />pessoas, governo e sociedade.</h2><div className="statement-foot"><p>Combinamos rigor jurídico e leitura de contexto para transformar complexidade em decisões claras.</p><a className="text-link" href="/atuacao">Conheça nossa atuação <Arrow /></a></div></section>

    <section className="areas section" id="atuacao">
      <div className="section-aside"><span>Atuação</span><p>Soluções conectadas à realidade de cada cliente.</p></div>
      <div className="areas-list">{practiceAreas.map((item, i) => <button key={item.name} className={i === area ? "active" : ""} onMouseEnter={() => setArea(i)} onFocus={() => setArea(i)} onClick={() => setArea(i)}><span>{item.name}</span><b>↗</b><p>{item.description}</p></button>)}</div>
      <div className="area-panel"><img key={practiceAreas[area].image} src={practiceAreas[area].image} alt="Arquitetura contemporânea relacionada à área" /><span>{practiceAreas[area].name}</span></div>
    </section>

    <div className="editorial-strip"><div>EMPRESARIAL · TRIBUTÁRIO · IMOBILIÁRIO · CONTENCIOSO · ADMINISTRATIVO · CONTRATOS · EMPRESARIAL · TRIBUTÁRIO · IMOBILIÁRIO ·</div></div>

    <section className="featured section"><div className="featured-image"><img src={articles[0].image} alt="Interior de escritório contemporâneo" /></div><div className="featured-copy"><span>Em destaque · {articles[0].category}</span><h2>{articles[0].title}</h2><p>{articles[0].excerpt}</p><div><small>{articles[0].date} · {articles[0].readingTime}</small><a className="circle-link" href={`/artigos/${articles[0].slug}`} aria-label="Ler artigo"><Arrow /></a></div></div></section>

    <section className="team section"><div className="team-head"><h2>Conhecimento tem<br /><em>muitas perspectivas.</em></h2><p>Nossa equipe reúne experiências complementares e atua de forma integrada para compreender cada desafio por inteiro.</p></div><div className="team-grid">{lawyers.slice(0, 5).map((person, i) => <a className={`person person-${i}`} href={`/advogados/${person.slug}`} key={person.slug}><img src={person.image} alt={`Retrato de ${person.name}`} loading="lazy" /><div><h3>{person.name}</h3><span>{person.role} · {person.areas[0]}</span></div></a>)}</div><a className="text-link team-link" href="/advogados">Conheça toda a equipe <Arrow /></a></section>

    <section className="dark-section"><div className="dark-image" /><div className="dark-copy"><span>Presença institucional</span><h2>Experiência para<br />compreender o presente.<br /><em>Visão para antecipar</em><br />o próximo movimento.</h2><p>Atuação próxima, multidisciplinar e orientada aos pontos que realmente transformam uma decisão.</p></div></section>

    <section className="numbers section"><div className="number-intro"><span>Estrutura</span><h2>Amplitude para atuar.<br />Proximidade para entender.</h2></div><div className="numbers-grid"><div><strong>20<sup>+</sup></strong><span>anos de experiência</span></div><div><strong>12</strong><span>áreas integradas</span></div><div><strong>500<sup>+</sup></strong><span>assuntos conduzidos</span></div><div><strong>BR</strong><span>atuação nacional</span></div></div><small className="data-note">Indicadores institucionais sujeitos à atualização.</small></section>

    <section className="insights section"><div className="insights-title"><h2>Perspectivas</h2><a className="text-link" href="/artigos">Todas as publicações <Arrow /></a></div><div className="insights-layout"><a className="insight-main" href={`/artigos/${articles[1].slug}`}><img src={articles[1].image} alt="Arquitetura urbana" loading="lazy" /><span>{articles[1].category}</span><h3>{articles[1].title}</h3></a><div className="insight-list">{articles.slice(1).map((post) => <a href={`/artigos/${post.slug}`} key={post.slug}><span>{post.category}</span><h3>{post.title}</h3><small>{post.date} · {post.readingTime}</small><Arrow /></a>)}</div></div></section>

    <section className="presence"><div><span>Brasília</span><h2>Um olhar a partir do centro.<br /><em>Uma atuação sem fronteiras.</em></h2><p>Sede em Brasília. Atuação em todo o Brasil, com articulação técnica e presença onde cada questão exige.</p></div><div className="presence-image"><img src="https://images.unsplash.com/photo-1554469384-e58fac16e23a?auto=format&fit=crop&w=1600&q=85" alt="Arquitetura monumental brasileira" loading="lazy" /></div></section>
    <Cta />
    <Contact />
  </main>;
}

function Cta() { return <section className="cta"><p>Cada desafio exige<br /><em>uma estratégia própria.</em></p><a href="/contato">Converse com nossa equipe <Arrow /></a></section>; }

function Contact() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  async function submit(e: FormEvent<HTMLFormElement>) { e.preventDefault(); setStatus("sending"); const fd = new FormData(e.currentTarget); await sendContact(Object.fromEntries(fd) as never); setStatus("sent"); e.currentTarget.reset(); }
  return <section className="contact section" id="contato"><div className="contact-info"><span>Contato</span><h2>Vamos<br /><em>conversar.</em></h2><p>Conte-nos brevemente sobre o seu contexto. Nossa equipe retornará o contato.</p><div><a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a><a href={`tel:${siteConfig.phone}`}>{siteConfig.phone}</a><span>{siteConfig.address}</span></div></div><form onSubmit={submit}><label>Nome<input name="name" required /></label><label>E-mail<input name="email" type="email" required /></label><div className="form-row"><label>Telefone<input name="phone" /></label><label>Empresa<input name="company" /></label></div><label>Assunto<input name="subject" required /></label><label>Mensagem<textarea name="message" rows={3} required /></label><button type="submit" disabled={status === "sending"}>{status === "sending" ? "Enviando..." : status === "sent" ? "Mensagem recebida ✓" : "Enviar mensagem"} <Arrow /></button></form></section>;
}

function PageHero({ label, title, text }: { label: string; title: string; text: string }) { return <section className="page-hero"><span>{label}</span><h1>{title}</h1><p>{text}</p></section>; }

function PracticePage() { return <main><PageHero label="Atuação" title="Estratégia que começa pela compreensão do todo." text="Áreas conectadas para responder a desafios jurídicos que raramente cabem em uma única especialidade." /><section className="practice-page section">{practiceAreas.map((item) => <article key={item.slug}><div><h2>{item.name}</h2><p>{item.description}</p><a href="/contato">Fale com a equipe <Arrow /></a></div><img src={item.image} alt="Arquitetura contemporânea" loading="lazy" /></article>)}</section><Cta /></main>; }

function LawyersPage() {
  const [filter, setFilter] = useState("Todos");
  const filters = ["Todos", "Sócios", "Empresarial", "Público", "Tributário", "Contencioso"];
  const visible = useMemo(() => lawyers.filter((p) => filter === "Todos" || (filter === "Sócios" ? p.role.includes("Sóci") : p.areas.includes(filter))), [filter]);
  return <main><PageHero label="Profissionais" title="Experiências diferentes. Uma visão integrada." text="Conhecimento técnico, proximidade e leitura de contexto em uma equipe que trabalha de forma verdadeiramente colaborativa." /><section className="lawyers-page section"><div className="filters" aria-label="Filtrar profissionais">{filters.map((f) => <button className={filter === f ? "active" : ""} onClick={() => setFilter(f)} key={f}>{f}</button>)}</div><div className="lawyers-grid">{visible.map((p) => <a href={`/advogados/${p.slug}`} key={p.slug}><img src={p.image} alt={`Retrato de ${p.name}`} /><h2>{p.name}</h2><span>{p.role}</span><p>{p.areas.join(" · ")}</p></a>)}</div></section></main>;
}

function LawyerPage({ slug }: { slug: string }) { const p = lawyers.find((x) => x.slug === slug) || lawyers[0]; return <main className="profile"><section className="profile-hero"><img src={p.image} alt={`Retrato de ${p.name}`} /><div><a href="/advogados">← Profissionais</a><span>{p.role}</span><h1>{p.name}</h1><p>{p.areas.join(" · ")}</p></div></section><section className="profile-body section"><div><span>Experiência</span><h2>{p.bio}</h2></div><div className="profile-details"><section><h3>Formação</h3>{p.education.map((x) => <p key={x}>{x}</p>)}</section><section><h3>Áreas de atuação</h3>{p.areas.map((x) => <p key={x}>{x}</p>)}</section><section><h3>Idiomas</h3>{p.languages.map((x) => <p key={x}>{x}</p>)}</section></div></section><Cta /></main>; }

function ArticlesPage() { const [filter, setFilter] = useState("Todos"); const cats = ["Todos", ...Array.from(new Set(articles.map((a) => a.category)))]; const visible = filter === "Todos" ? articles : articles.filter((a) => a.category === filter); return <main><PageHero label="Perspectivas" title="Conhecimento para interpretar o que está em movimento." text="Análises objetivas sobre decisões, mudanças regulatórias e temas que atravessam negócios e instituições." /><section className="articles-page section"><div className="filters">{cats.map((c) => <button className={c === filter ? "active" : ""} key={c} onClick={() => setFilter(c)}>{c}</button>)}</div><div className="articles-grid">{visible.map((a, i) => <a className={i === 0 ? "large" : ""} href={`/artigos/${a.slug}`} key={a.slug}><img src={a.image} alt="Imagem editorial do artigo" /><span>{a.category}</span><h2>{a.title}</h2><p>{a.excerpt}</p><small>{a.date} · {a.readingTime}</small></a>)}</div></section></main>; }

function ArticlePage({ slug }: { slug: string }) { const a = articles.find((x) => x.slug === slug) || articles[0]; const related = articles.filter((x) => x.slug !== a.slug).slice(0, 2); return <main className="article-page"><header><a href="/artigos">← Perspectivas</a><span>{a.category}</span><h1>{a.title}</h1><p>{a.excerpt}</p><small>{a.date} · {a.readingTime} · Por {a.author}</small></header><img className="article-cover" src={a.image} alt="Imagem editorial do artigo" /><article><p className="lead">Em ambientes de alta complexidade, a qualidade das decisões depende menos de respostas isoladas e mais da capacidade de organizar contexto, responsabilidades e caminhos possíveis.</p><h2>Clareza antes da velocidade</h2><p>Decisões estratégicas exigem uma arquitetura jurídica capaz de acompanhar a realidade do negócio. Isso significa identificar riscos relevantes, estabelecer critérios de governança e construir instrumentos que permaneçam úteis quando o cenário muda.</p><p>O papel da assessoria jurídica contemporânea é traduzir complexidade sem simplificá-la em excesso. A análise precisa conectar regulação, operação, reputação e objetivos de longo prazo.</p><blockquote>Uma boa estratégia jurídica não limita o movimento. Ela cria condições para que ele aconteça com segurança.</blockquote><h2>Visão integrada e ação coordenada</h2><p>Quando diferentes especialidades trabalham de forma conectada, a organização ganha consistência. Contratos, estrutura societária, relações institucionais e prevenção de disputas deixam de ser frentes independentes e passam a compor uma mesma estratégia.</p></article><section className="related section"><h2>Continue lendo</h2><div>{related.map((r) => <a href={`/artigos/${r.slug}`} key={r.slug}><span>{r.category}</span><h3>{r.title}</h3><Arrow /></a>)}</div></section></main>; }

function LegalPage({ type }: { type: "privacidade" | "termos" }) { const privacy = type === "privacidade"; return <main><PageHero label="Institucional" title={privacy ? "Política de privacidade" : "Termos de uso"} text="Informações claras sobre este ambiente digital." /><article className="legal section"><p>Última atualização: 14 de agosto de 2026.</p><h2>{privacy ? "Tratamento de informações" : "Uso deste site"}</h2><p>{privacy ? "As informações enviadas pelo formulário de contato são utilizadas exclusivamente para responder à solicitação. Não comercializamos dados pessoais e adotamos medidas adequadas de segurança." : "O conteúdo deste site possui caráter exclusivamente informativo e não constitui parecer jurídico nem cria relação profissional entre o visitante e o escritório."}</p><h2>Contato</h2><p>Para dúvidas relacionadas a este documento, escreva para <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>.</p></article></main>; }

export function Site({ route }: { route: string }) {
  let content: React.ReactNode;
  if (route === "/") content = <Home />;
  else if (route === "/atuacao") content = <PracticePage />;
  else if (route === "/advogados") content = <LawyersPage />;
  else if (route.startsWith("/advogados/")) content = <LawyerPage slug={route.split("/").pop() || ""} />;
  else if (route === "/artigos") content = <ArticlesPage />;
  else if (route.startsWith("/artigos/")) content = <ArticlePage slug={route.split("/").pop() || ""} />;
  else if (route === "/contato") content = <main><PageHero label="Contato" title="Toda boa estratégia começa com uma conversa." text="Compartilhe seu contexto. Nossa equipe entrará em contato para compreender o próximo passo." /><Contact /></main>;
  else if (route === "/privacidade" || route === "/termos") content = <LegalPage type={route.slice(1) as "privacidade" | "termos"} />;
  else content = <main><PageHero label="404" title="Esta página não está em movimento." text="O endereço pode ter mudado. Volte ao início para continuar navegando." /><section className="not-found"><a href="/">Voltar à página inicial <Arrow /></a></section></main>;
  return <><Header />{content}<Footer /></>;
}
