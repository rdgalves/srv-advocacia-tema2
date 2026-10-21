"use client";
/* eslint-disable @next/next/no-html-link-for-pages, @next/next/no-img-element */

import { FormEvent, useEffect, useState } from "react";
import { lawyers } from "../src/data/lawyers";
import { practiceAreas } from "../src/data/practiceAreas";
import { siteConfig } from "../src/config/site";
import { sendContact } from "../src/services/contact";

const Arrow = () => <span aria-hidden="true">↗</span>;

function Logo({ light = false }: { light?: boolean }) {
  return <img className={`logo ${light ? "logo-light" : ""}`} src="/srv-logo.png" alt={siteConfig.name} />;
}

function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll(); window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const links = [["Escritório", "/#escritorio"], ["Atuação", "/atuacao"], ["Profissional", "/advogados"], ["Publicações", "/artigos"], ["Contato", "/contato"]];
  return <>
    <header className={`header ${scrolled ? "is-scrolled" : ""}`}><a href="/" aria-label="Página inicial"><Logo /></a><nav className="desktop-nav" aria-label="Navegação principal">{links.map(([n, h]) => <a key={n} href={h}>{n}</a>)}</nav><a className="header-cta" href="/contato">Fale conosco <Arrow /></a><button className="menu-button" onClick={() => setOpen(!open)} aria-expanded={open} aria-label={open ? "Fechar menu" : "Abrir menu"}><span /><span /></button></header>
    <div className={`mobile-menu ${open ? "open" : ""}`} aria-hidden={!open}><Logo light /><nav>{links.map(([n, h]) => <a key={n} href={h} onClick={() => setOpen(false)}>{n}<Arrow /></a>)}</nav><p>{siteConfig.address}<br />{siteConfig.businessHours}</p></div>
  </>;
}

function Footer() {
  return <footer className="footer">
    <div className="footer-top"><Logo light /><p>Atuação próxima.<br />Estratégia para cada caso.</p></div>
    <div className="footer-grid">
      <div><small>Navegação</small><a href="/#escritorio">Escritório</a><a href="/atuacao">Atuação</a><a href="/advogados">Profissional</a><a href="/artigos">Publicações</a></div>
      <div><small>Endereço e atendimento</small><span>{siteConfig.address}</span><span>{siteConfig.businessHours}</span></div>
      <div><small>Institucional</small><a href="/privacidade">Privacidade</a><a href="/termos">Termos de uso</a><a href={siteConfig.social.linkedin} target="_blank" rel="noreferrer">LinkedIn</a><a href={siteConfig.social.lattes} target="_blank" rel="noreferrer">Currículo Lattes</a></div>
    </div>
    <div className="marquee" aria-hidden="true"><div>CIVIL · TRIBUTÁRIO · PENAL ECONÔMICO · SOCIETÁRIO · CIVIL · TRIBUTÁRIO · PENAL ECONÔMICO · SOCIETÁRIO ·</div></div>
    <div className="footer-bottom"><span>© 2026 {siteConfig.legalName}</span><span>Brasília · Distrito Federal</span></div>
  </footer>;
}

function Home() {
  const [area, setArea] = useState(0);
  return <main>
    <section className="hero"><div className="hero-copy"><p className="hero-kicker">Advocacia estratégica · Brasília/DF</p><h1>Estratégia jurídica<br />para demandas que<br /><em>pedem atenção.</em></h1><div className="hero-meta"><span>Fundado em 2022</span><span>Atuação no TRF1, TJDFT e STJ</span></div></div><div className="hero-visual"><div className="hero-image" /><div className="hero-line" /><p>Contato próximo.<br />Assessoria individualizada.</p></div><a className="scroll-note" href="#escritorio">Descubra <span>↓</span></a></section>

    <section className="statement section" id="escritorio"><div className="statement-mark">SRV</div><p>Um escritório que nasceu para fazer diferente.</p><h2>Autenticidade, proximidade<br />e estratégia jurídica.</h2><div className="statement-foot"><p>Fundado em 2022 por Salomão Rezende Veloso, o escritório nasceu da vontade de fugir do modelo de escritórios de massa e oferecer assessoria jurídica estratégica, individualizada e conectada à demanda real de cada caso.</p><a className="text-link" href="/advogados">Conheça o fundador <Arrow /></a></div></section>

    <section className="areas section" id="atuacao"><div className="section-aside"><span>Atuação</span><p>Estratégia jurídica construída a partir da realidade de cada cliente.</p></div><div className="areas-list">{practiceAreas.map((item, i) => <button key={item.name} className={i === area ? "active" : ""} onMouseEnter={() => setArea(i)} onFocus={() => setArea(i)} onClick={() => setArea(i)}><span>{item.name}</span><b>↗</b><p>{item.description}</p></button>)}</div><div className="area-panel"><img key={practiceAreas[area].image} src={practiceAreas[area].image} alt="Ambiente do escritório Salomão Rezende Veloso Advocacia" /><span>{practiceAreas[area].name}</span></div></section>

    <div className="editorial-strip"><div>CIVIL · CONTENCIOSO CÍVEL · TRIBUTÁRIO · PENAL ECONÔMICO · SOCIETÁRIO · CIVIL · CONTENCIOSO CÍVEL ·</div></div>

    <section className="team section"><div className="team-head"><h2>Experiência técnica.<br /><em>Atuação pessoal.</em></h2><p>O acompanhamento próximo permite compreender o contexto, avaliar os riscos e construir uma estratégia compatível com os objetivos de cada cliente.</p></div><a className="founder-card" href="/advogados/salomao-rezende-veloso"><img className="professional-photo" src={lawyers[0].image} alt={`Retrato de ${lawyers[0].name}`} /><div><span>{lawyers[0].role} · {lawyers[0].oab}</span><h3>{lawyers[0].name}</h3><p>{lawyers[0].bio}</p><b>Conheça a trajetória <Arrow /></b></div></a></section>

    <section className="dark-section"><div className="dark-image" /><div className="dark-copy"><span>Presença institucional</span><h2>Sede em Brasília.<br /><em>Atuação qualificada</em><br />nos tribunais.</h2><p>Atuação perante o Tribunal Regional Federal da 1ª Região, o Tribunal de Justiça do Distrito Federal e dos Territórios e o Superior Tribunal de Justiça.</p></div></section>

    <section className="numbers section"><div className="number-intro"><span>Escritório</span><h2>Informação objetiva.<br />Relacionamento transparente.</h2></div><div className="numbers-grid"><div><strong>2022</strong><span>ano de fundação</span></div><div><strong>04</strong><span>áreas de atuação</span></div><div><strong>03</strong><span>tribunais de atuação</span></div><div><strong>DF</strong><span>sede em Brasília</span></div></div></section>

    <section className="presence"><div><span>Brasília/DF</span><h2>No centro do país.<br /><em>Perto de cada cliente.</em></h2><p>Atendimento de segunda a sexta-feira, das 08h às 20h, no Complexo Brasil 21, em Brasília.</p></div><div className="presence-image"><img src="/escritorio-recepcao.jpg" alt="Recepção do escritório Salomão Rezende Veloso Advocacia" loading="lazy" /></div></section>
    <Cta /><Contact />
  </main>;
}

function Cta() { return <section className="cta"><p>Cada caso exige<br /><em>uma estratégia própria.</em></p><a href="/contato">Fale com o escritório <Arrow /></a></section>; }

function Contact() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  async function submit(e: FormEvent<HTMLFormElement>) { e.preventDefault(); setStatus("sending"); const form = e.currentTarget; const fd = new FormData(form); await sendContact(Object.fromEntries(fd) as never); setStatus("sent"); form.reset(); }
  const mapUrl = `https://www.google.com/maps?q=${encodeURIComponent(siteConfig.mapQuery)}&output=embed`;
  const directionsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(siteConfig.mapQuery)}`;
  return <section className="contact section" id="contato"><div className="contact-info"><span>Contato</span><h2>Vamos<br /><em>conversar.</em></h2><p>Conte brevemente o seu contexto. A demanda será analisada com atenção e individualidade.</p><div className="contact-details"><span>{siteConfig.businessHours}</span><a className="address-link" href={directionsUrl} target="_blank" rel="noreferrer">{siteConfig.address} <Arrow /></a></div><div className="contact-map"><iframe src={mapUrl} title={`Mapa de ${siteConfig.address}`} loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen /></div></div><form onSubmit={submit}><label>Nome<input name="name" required /></label><label>E-mail<input name="email" type="email" required /></label><div className="form-row"><label>Telefone<input name="phone" /></label><label>Empresa<input name="company" /></label></div><label>Assunto<input name="subject" required /></label><label>Mensagem<textarea name="message" rows={3} required /></label><button type="submit" disabled={status === "sending"}>{status === "sending" ? "Enviando..." : status === "sent" ? "Mensagem recebida ✓" : "Enviar mensagem"} <Arrow /></button></form></section>;
}

function PageHero({ label, title, text }: { label: string; title: string; text: string }) { return <section className="page-hero"><span>{label}</span><h1>{title}</h1><p>{text}</p></section>; }

function PracticePage() { return <main><PageHero label="Atuação" title="Estratégia jurídica para a demanda real de cada caso." text="Atuação em Brasília/DF, perante o TRF1, o TJDFT e o STJ." /><section className="practice-page section">{practiceAreas.map((item) => <article key={item.slug}><div><h2>{item.name}</h2><p>{item.description}</p><a href="/contato">Fale com o escritório <Arrow /></a></div><img src={item.image} alt="Ambiente do escritório Salomão Rezende Veloso Advocacia" loading="lazy" /></article>)}</section><Cta /></main>; }

function LawyersPage() { const p = lawyers[0]; return <main><PageHero label="Profissional" title="Formação contínua. Atuação próxima." text="Conheça a trajetória do fundador do escritório." /><section className="lawyers-page section"><a className="founder-card" href={`/advogados/${p.slug}`}><img className="professional-photo" src={p.image} alt={`Retrato de ${p.name}`} /><div><span>{p.role} · {p.oab}</span><h2>{p.name}</h2><p>{p.bio}</p><b>Ver perfil completo <Arrow /></b></div></a></section></main>; }

function LawyerPage() { const p = lawyers[0]; return <main className="profile"><section className="profile-hero"><img src={p.image} alt={`Retrato de ${p.name}`} /><div><a href="/advogados">← Profissional</a><span>{p.role} · {p.oab}</span><h1>{p.name}</h1><p>{p.areas.join(" · ")}</p></div></section><section className="profile-body section"><div><span>Trajetória</span><h2>{p.bio}</h2><p className="profile-links"><a href={p.lattes} target="_blank" rel="noreferrer">Currículo Lattes <Arrow /></a><a href={p.linkedin} target="_blank" rel="noreferrer">LinkedIn <Arrow /></a></p></div><div className="profile-details"><section><h3>Formação</h3>{p.education.map((x) => <p key={x}>{x}</p>)}</section><section><h3>Experiência profissional</h3>{p.experience.map((x) => <p key={x}>{x}</p>)}</section><section><h3>Áreas de atuação</h3>{p.areas.map((x) => <p key={x}>{x}</p>)}</section><section><h3>Idiomas</h3>{p.languages.map((x) => <p key={x}>{x}</p>)}</section></div></section><Cta /></main>; }

function ArticlesPage() { return <main><PageHero label="Publicações" title="Conteúdo jurídico em preparação." text="Este espaço será dedicado a análises sobre temas relevantes das áreas de atuação do escritório." /><section className="empty-state section"><span>Em breve</span><h2>Novas perspectivas serão publicadas aqui.</h2><a className="text-link" href="/contato">Fale com o escritório <Arrow /></a></section></main>; }

function LegalPage({ type }: { type: "privacidade" | "termos" }) { const privacy = type === "privacidade"; return <main><PageHero label="Institucional" title={privacy ? "Política de privacidade" : "Termos de uso"} text="Informações claras sobre este ambiente digital." /><article className="legal section"><p>Última atualização: 21 de outubro de 2026.</p><h2>{privacy ? "Tratamento de informações" : "Uso deste site"}</h2><p>{privacy ? "As informações enviadas pelo formulário de contato são utilizadas exclusivamente para analisar e responder à solicitação. Não comercializamos dados pessoais e adotamos medidas adequadas de segurança." : "O conteúdo deste site possui caráter exclusivamente informativo e não constitui parecer jurídico nem cria relação profissional entre o visitante e o escritório."}</p><h2>Responsável</h2><p>{siteConfig.legalName}. Solicitações relacionadas a este documento podem ser encaminhadas pelo formulário de contato.</p></article></main>; }

export function Site({ route }: { route: string }) {
  let content: React.ReactNode;
  if (route === "/") content = <Home />;
  else if (route === "/atuacao") content = <PracticePage />;
  else if (route === "/advogados") content = <LawyersPage />;
  else if (route.startsWith("/advogados/")) content = <LawyerPage />;
  else if (route === "/artigos") content = <ArticlesPage />;
  else if (route.startsWith("/artigos/")) content = <ArticlesPage />;
  else if (route === "/contato") content = <main><PageHero label="Contato" title="Toda boa estratégia começa com uma conversa." text="Compartilhe seu contexto para uma análise atenta e individualizada." /><Contact /></main>;
  else if (route === "/privacidade" || route === "/termos") content = <LegalPage type={route.slice(1) as "privacidade" | "termos"} />;
  else content = <main><PageHero label="404" title="Esta página não foi encontrada." text="O endereço pode ter mudado. Volte ao início para continuar navegando." /><section className="not-found"><a href="/">Voltar à página inicial <Arrow /></a></section></main>;
  return <><Header />{content}<Footer /></>;
}
