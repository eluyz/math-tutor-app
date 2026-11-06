import {rational as r,type Rational} from '../rational';
import type {UniversityFamily} from './schema';
import type {Locale} from '../locales/types';
import {teaching} from './teaching';
export type ElementaryPartialProblem=Readonly<{kind:'multivar-elementary-partial';mode:'log'|'root';a:number;b:number;c:number;d:number;target:'x'|'y'|'xx'|'xy'|'yx'|'yy'}>;
export const elementaryPartialFamilies:readonly UniversityFamily[]=[{
 id:'multivar-elementary-partial',category:'derivatives',titles:{pl:'Pochodne cząstkowe logarytmu i pierwiastka jako funkcje',en:'Logarithm and square-root partials as functions'},supportedDifficulties:['hard'],
 create:(v)=>({kind:'multivar-elementary-partial',mode:v%2?'root':'log',a:1+v%3,b:v%4<2?1:-2,c:-(1+v%5),d:2+Math.floor(v/12),target:(['x','y','xx','xy','yx','yy'] as const)[Math.floor(v/2)%6]}),
}];
export function elementaryPartialCoefficients(p:ElementaryPartialProblem):readonly Rational[]{
 const {a,b,c}=p,half=p.mode==='root'?0.5:1,quarter=p.mode==='root'?0.25:1;
 const first=p.target==='x'||p.target==='y';
 const coefficients=first?(p.target==='x'?[2*a*half,b*half]:[b*half,2*c*half]):
 p.target==='xx'?[2*a*half,-4*a*a*quarter,-4*a*b*quarter,-b*b*quarter]:
 p.target==='yy'?[2*c*half,-b*b*quarter,-4*b*c*quarter,-4*c*c*quarter]:
 [b*half,-2*a*b*quarter,-(4*a*c+b*b)*quarter,-2*b*c*quarter];
 return coefficients.map(n=>r(n*4,4));
}
export function presentElementaryPartial(p:ElementaryPartialProblem,locale:Locale){
 const lesson=teaching(locale),{t}=lesson,{a,b,c,d}=p;
 const U=`(${a})x²+(${b})xy+(${c})y²+(${d})`,target='f_'+p.target,first=p.target==='x'||p.target==='y';
 const base=p.mode==='log'?'u':'√u',den=p.mode==='log'?'u²':'u^(3/2)';
 const labels=first?[`x/${base}`,`y/${base}`]:[`1/${base}`,`x²/${den}`,`xy/${den}`,`y²/${den}`];
 const values=elementaryPartialCoefficients(p);
 const answer={kind:'list' as const,labels,values};
 lesson.work(`u(x,y)=${U}; f=${p.mode==='log'?'ln(u)':'√u'}`,
 t('Wyznaczamy pochodną jako funkcję, bez podstawiania punktu.','Find the derivative as a function, without substituting a point.'));
 lesson.work(p.mode==='log'?'D(f)={u>0}; D(C²)={u>0}':'D(f)={u≥0}; D(C²)={u>0}',
 p.mode==='log'?t('Logarytm wymaga u>0; punkty u=0 są wyłączone. Na tym otwartym zbiorze funkcja jest gładka.','The logarithm requires u>0; points u=0 are excluded. The function is smooth on this open set.'):t('Pierwiastek wymaga u≥0. Wzory na pochodne obowiązują na otwartym zbiorze u>0, bez brzegu u=0.','The square root requires u≥0. Derivative formulas apply on the open set u>0, excluding the boundary u=0.'));
 lesson.work(`u_x=(${2*a})x+(${b})y; u_y=(${b})x+(${2*c})y; u_xx=${2*a}; u_xy=u_yx=${b}; u_yy=${2*c}`,
 t('Różniczkuj argument osobno po x i y, traktując drugą zmienną jako stałą.','Differentiate the argument in x and y separately, holding the other variable constant.'));
 lesson.work(p.mode==='log'?'F′(u)=1/u; F″(u)=−1/u²':'F′(u)=1/(2√u); F″(u)=−1/(4u^(3/2))',
 t('Oblicz dwie pochodne funkcji zewnętrznej; zachowaj znak i czynniki 1/2 oraz 1/4.','Compute two outer derivatives; preserve the sign and the factors 1/2 and 1/4.'));
 lesson.work('f_i=F′(u)u_i; f_ij=F″(u)u_i u_j+F′(u)u_ij',
 t('Drugie różniczkowanie łączy regułę iloczynu i łańcuchową. Na u>0 funkcja jest C², więc f_xy=f_yx.','The second differentiation combines product and chain rules. On u>0 the function is C², so f_xy=f_yx.'));
 const deriv=(s:string)=>`u_${s}`;
 lesson.work(first?`${target}=F′(u)${deriv(p.target)}`:`${target}=F″(u)${deriv(p.target[0])}${deriv(p.target[1])}+F′(u)${deriv(p.target)}`,
 t('Wstaw właściwe pochodne argumentu, a następnie rozwiń iloczyny.','Insert the appropriate inner derivatives, then expand the products.'));
 lesson.work(`${target}=`+values.map((v,i)=>`(${v.numerator}/${v.denominator})·${labels[i]}`).join(' + '),
 t('Podaj współczynniki w pokazanej kolejności bazy. Jest to tożsamość funkcji na u>0; pozostaw u jako podane wyrażenie kwadratowe.','Enter coefficients in the displayed basis order. This is a function identity on u>0; retain u as the specified quadratic expression.'));
 return lesson.finish(t('Wyznacz ','Find ')+target+t(' jako funkcję na u>0. Wpisz współczynniki w bazie: ',' as a function on u>0. Enter coefficients in the basis: ')+labels.join(', ')+`.\nu=${U}; f=${p.mode==='log'?'ln(u)':'√u'}.`,answer,
 t('Najpierw ustal dziedzinę i pochodne argumentu u.','First establish the domain and the derivatives of u.'),
 first?t('Zastosuj F′(u)u_i i rozwiń licznik.','Use F′(u)u_i and expand the numerator.'):t('Użyj F″(u)u_i u_j+F′(u)u_ij; uwzględnij oba składniki.','Use F″(u)u_i u_j+F′(u)u_ij; include both terms.'));
}
