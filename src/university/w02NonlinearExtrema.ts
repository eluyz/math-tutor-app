import {rational as r,addRational as add,subtractRational as sub,multiplyRational as mul,divideRational as div,type Rational} from '../rational';
import {formatRational as f,type AnswerSpec} from '../answers';
import {polynomialRoots} from './polynomial';
import type {UniversityFamily} from './schema';
import type {Locale} from '../locales/types';
import {teaching} from './teaching';

/** Authored controlled quadratic/cubic family; no stored critical points. */
export type W02NonlinearProblem=Readonly<{
 kind:'multivar-quadratic-cubic-extrema';a:Rational;b:Rational;c:Rational;d:Rational;e:Rational;offset:Rational;mode?:'three'|'four';
}>;
const sq=(x:Rational)=>mul(x,x),neg=(x:Rational)=>sub(r(0),x);
export const w02NonlinearFamilies:readonly UniversityFamily[]=[{
 id:'multivar-quadratic-cubic-extrema',category:'derivatives',
 titles:{pl:'Ekstrema kwadratowo-sześcienne — kompletna lista punktów',en:'Quadratic-cubic extrema — complete stationary-point set'},
 supportedDifficulties:['hard','advanced'],create:(v,level):W02NonlinearProblem=>{
  if(level==='advanced'){
   if(!Number.isInteger(v)||v<0||v>=24)throw Error('Invalid advanced W02 variant');
   const n=Math.floor(v/2),offset=r(n-5,3);
   if(v%2===0){
    const p=1+n%3,q=2+Math.floor(n/3)%2,c=1+n%4;
    return {kind:'multivar-quadratic-cubic-extrema',mode:'three',a:r(2*p*p),b:r(q*q),c:r(c),d:r(0),e:r(0),offset};
   }
   const t=1+n%3,m=6+2*(Math.floor(n/3)%4);
   return {kind:'multivar-quadratic-cubic-extrema',mode:'four',a:r(2*t),b:r((m*m-6*t)/2),c:r(1),d:r(1),e:r(0),offset};
  }
  const a=r((v%2?-1:1)*(2+Math.floor(v/8)),2),b=r((Math.floor(v/2)%2?-1:1)*(1+v%3),2);
  const c=r((Math.floor(v/4)%2?-1:1)*(1+Math.floor(v/12)),3);
  const lo=r(v%4-2,2),hi=add(lo,r(1+Math.floor(v/4)%3,2));
  const d=div(sub(div(sq(b),mul(r(2),a)),mul(mul(r(3),c),add(lo,hi))),r(2));
  return {kind:'multivar-quadratic-cubic-extrema',a,b,c,d,e:mul(mul(r(3),c),mul(lo,hi)),offset:r(v-11,3)};
 }
}];
export function nonlinearValue(p:W02NonlinearProblem,x:Rational,y:Rational){
 if(p.mode)throw Error('Use sourceStationaryPoints for advanced W02 modes');
 return add(add(add(mul(p.a,sq(x)),mul(p.b,mul(x,y))),mul(p.c,mul(sq(y),y))),add(add(mul(p.d,sq(y)),mul(p.e,y)),p.offset));
}
export function nonlinearCriticalPoints(p:W02NonlinearProblem){
 if(p.mode)throw Error('Use sourceStationaryPoints for advanced W02 modes');
 if([p.a,p.b,p.c].some(x=>x.numerator===0n))throw Error('Expected nonzero a, b, c in controlled family');
 const A=mul(r(3),p.c),B=sub(mul(r(2),p.d),div(sq(p.b),mul(r(2),p.a))),C=p.e;
 const delta=sub(sq(B),mul(r(4),mul(A,C)));
 if(delta.numerator<=0n)throw Error('Controlled family requires two distinct rational roots; D=0 is not a no-extremum verdict');
 const roots=polynomialRoots([C,B,A]).sort((x,y)=>{const n=sub(x,y).numerator;return n<0n?-1:n>0n?1:0;});
 if(roots.length!==2)throw Error('Expected two distinct roots');
 const factor=div(neg(p.b),mul(r(2),p.a));
 const points=roots.map(y=>{
  const x=mul(factor,y),xx=mul(r(2),p.a),xy=p.b,yy=add(mul(mul(r(6),p.c),y),mul(r(2),p.d));
  const D=sub(mul(xx,yy),sq(xy));
  if(D.numerator===0n)throw Error('Unexpected degenerate point in controlled family');
  return {x,y,xx,xy,yy,D,value:nonlinearValue(p,x,y),kind:D.numerator<0n?'saddle' as const:xx.numerator>0n?'minimum' as const:'maximum' as const};
 });
 return {A,B,C,delta,factor,points};
}
export function presentW02Nonlinear(p:W02NonlinearProblem,locale:Locale){
 if(p.mode)return presentAdvancedW02(p,locale);
 const lesson=teaching(locale),{t}=lesson,z=nonlinearCriticalPoints(p);
 const expr=`(${f(p.a)})x²+(${f(p.b)})xy+(${f(p.c)})y³+(${f(p.d)})y²+(${f(p.e)})y+(${f(p.offset)})`;
 const name=(kind:string)=>kind==='minimum'?t('minimum lokalne','local minimum'):kind==='maximum'?t('maksimum lokalne','local maximum'):t('punkt siodłowy','saddle point');
 const point=(q:typeof z.points[number])=>`(${f(q.x)},${f(q.y)})`;
 lesson.work(`f(x,y)=${expr}; D(f)=ℝ²; f∈C∞(ℝ²)`,t('Wielomian jest gładki na otwartej płaszczyźnie. Każde ekstremum lokalne musi być punktem stacjonarnym.','The polynomial is smooth on the open plane. Every local extremum must be stationary.'));
 lesson.work(`f_x=(${f(mul(r(2),p.a))})x+(${f(p.b)})y; f_y=(${f(p.b)})x+(${f(mul(r(3),p.c))})y²+(${f(mul(r(2),p.d))})y+(${f(p.e)})`,t('Oblicz pełny gradient i rozwiąż oba równania f_x=0 oraz f_y=0 równocześnie.','Compute the full gradient and solve f_x=0 and f_y=0 simultaneously.'));
 lesson.work(`f_x=0 ⇔ x=(${f(z.factor)})y; 2a=${f(mul(r(2),p.a))}≠0`,t('Dzielimy tylko przez niezerową stałą 2a, nigdy przez x ani y. Rozwiązania z zerową współrzędną pozostają w układzie.','Divide only by the nonzero constant 2a, never by x or y. Points with a zero coordinate remain in the system.'));
 lesson.work(`f_y=0 ⇔ q(y)=(${f(z.A)})y²+(${f(z.B)})y+(${f(z.C)})=0`,t('Podstaw x do drugiego równania: q(y)=3cy²+(2d−b²/(2a))y+e. Jest to równoważna eliminacja.','Substitute x into the second equation: q(y)=3cy²+(2d−b²/(2a))y+e. This elimination is equivalent to the system.'));
 lesson.work(`Δ=(${f(z.B)})²−4(${f(z.A)})(${f(z.C)})=${f(z.delta)}>0; y=(−(${f(z.B)})±√(${f(z.delta)}))/(2(${f(z.A)}))∈{${z.points.map(q=>f(q.y)).join(',')}}`,t('Dodatni wyróżnik daje dokładnie dwa różne pierwiastki rzeczywiste. Uporządkuj je rosnąco i oblicz odpowiadające x.','A positive discriminant gives exactly two distinct real roots. Sort them increasingly and calculate the corresponding x coordinates.'));
 lesson.work(`∇f=0 ⇔ {P₁=${point(z.points[0])}, P₂=${point(z.points[1])}}; y₁<y₂`,t('Każdemu pierwiastkowi y odpowiada dokładnie jedno x. Podstawienie do obu równań gradientu potwierdza oba punkty; innych nie ma.','Each y root determines exactly one x. Substitution into both original gradient equations verifies both points; there are no others.'));
 lesson.work(`H(x,y)=[[${f(mul(r(2),p.a))},${f(p.b)}],[${f(p.b)},(${f(mul(r(6),p.c))})y+(${f(mul(r(2),p.d))})]]; f_xy=f_yx`,t('Wyznacz wszystkie drugie pochodne przed podstawieniem punktów. Pochodne mieszane są równe dla tego wielomianu.','Calculate all second partials before substituting either point. The mixed partials agree for this polynomial.'));
 const fields:Extract<AnswerSpec,{kind:'multi-choice'}>['fields'][number][]=[];
 z.points.forEach((q,i)=>{
  const n=i+1,label=i===0?'P₁':'P₂';
  lesson.work(`H(${label})=[[${f(q.xx)},${f(q.xy)}],[${f(q.xy)},${f(q.yy)}]]; D${n}=(${f(q.xx)})(${f(q.yy)})−(${f(q.xy)})²=${f(q.D)} ⇒ ${name(q.kind)}`,t('D<0 daje siodło; D>0 i f_xx>0 minimum, D>0 i f_xx<0 maksimum. D=0 byłoby nierozstrzygające, nie dowodem braku ekstremum.','D<0 gives a saddle; D>0 with f_xx>0 gives a minimum, and with f_xx<0 a maximum. D=0 would be inconclusive, not proof of no extremum.'));
  lesson.work(`f${point(q)}=${f(q.value)}; ${label}: ${name(q.kind)}`,q.kind==='saddle'?t('Jest to wartość funkcji w siodle, nie wartość ekstremum. Ujemny wyznacznik wyklucza minimum i maksimum w tym punkcie.','This is the function value at a saddle, not an extremal value. The negative determinant excludes a minimum and maximum at this point.'):t('Podstaw współrzędne do oryginalnego wielomianu bez zaokrągleń. Dodatni wyznacznik i znak f_xx dowodzą ścisłego ekstremum lokalnego.','Substitute into the original polynomial without rounding. The positive determinant and the sign of f_xx prove a strict local extremum.'));
  for(const [j,[key,value]]of ([['x',q.x],['y',q.y],['f',q.value],['D',q.D]] as const).entries()){
   const options=[value,add(value,r(1)),sub(value,r(1))].map(v=>({value:f(v),label:f(v)}));
   const shift=(i+j)%3;fields.push({id:`p${n}-${key}`,label:`${label}: ${key}`,value:f(value),options:[...options.slice(shift),...options.slice(0,shift)]});
  }
  fields.push({id:`p${n}-kind`,label:`${label}: `+t('rodzaj','type'),value:q.kind,options:[{value:'minimum',label:name('minimum')},{value:'maximum',label:name('maximum')},{value:'saddle',label:name('saddle')},{value:'inconclusive',label:t('test nierozstrzygający','inconclusive test')}]});
 });
 lesson.work(t('Dokładnie jedno ścisłe ekstremum lokalne i jeden punkt siodłowy.','Exactly one strict local extremum and one saddle point.'),t('Obliczono wszystkie punkty stacjonarne i sklasyfikowano każdy z nich. Warunek konieczny Fermata wyklucza inne ekstrema na ℝ².','All stationary points have been found and each has been classified. Fermat’s necessary condition excludes any other extrema on ℝ².'));
 return lesson.finish(t('Wyznacz wszystkie punkty stacjonarne i ekstrema lokalne. Uporządkuj punkty według y₁<y₂. Dla każdego podaj x, y, wartość funkcji f, wyznacznik Hessiana D i rodzaj punktu.','Find all stationary points and local extrema. Order the points by y₁<y₂. For each give x, y, function value f, Hessian determinant D and point type.')+`\nf(x,y)=${expr}`,
 {kind:'multi-choice',fields},t('Z równania f_x=0 wyznacz x przez y, dzieląc tylko przez stałą 2a≠0. Nie dziel przez zmienną.','Use f_x=0 to express x in terms of y, dividing only by the constant 2a≠0. Do not divide by a variable.'),t('Rozwiąż otrzymane równanie kwadratowe w y, zachowaj oba pierwiastki i zbadaj Hessian w obu punktach. Uporządkuj punkty według y.','Solve the resulting quadratic in y, retain both roots and examine the Hessian at both points. Order the points by y.'));
}


/** W02 source-shaped 3-/4-stationary-point cases. Distinct authored coefficients; no private worksheet reproduced. */
const cmpR=(a:Rational,b:Rational)=>sub(a,b).numerator<0n?-1:sub(a,b).numerator>0n?1:0;
const exactRoot=(z:Rational)=>{
 const n=Number(z.numerator),d=Number(z.denominator),p=Math.round(Math.sqrt(n)),q=Math.round(Math.sqrt(d));
 if(!Number.isSafeInteger(n)||!Number.isSafeInteger(d)||n<0||d<=0||p*p!==n||q*q!==d)
  throw Error('Expected an exact nonnegative rational square');
 return r(p,q);
};
type W02SourcePoint={x:Rational;y:Rational;xx:Rational;xy:Rational;yy:Rational;D:Rational;value:Rational;kind:'minimum'|'maximum'|'saddle'|'inconclusive'};
export function sourceStationaryPoints(p:W02NonlinearProblem):readonly W02SourcePoint[]{
 if(!p.mode)throw Error('Only advanced source-shaped modes');
 if([p.a,p.b,p.c].some(q=>q.numerator<=0n)||(p.mode==='four'&&p.d.numerator<=0n))
  throw Error('Positive nondegenerate coefficients required');
 const three=p.mode==='three';
 let locations:readonly (readonly [Rational,Rational])[];
 if(three){
  // f=a*x²+(b-c*x)*y²+k; f_y=2y(b-c*x).
  const x=div(p.b,p.c),y=exactRoot(div(mul(mul(r(2),p.a),p.b),sq(p.c)));
  locations=[[x,neg(y)],[r(0),r(0)],[x,y]];
 }else{
  // f=a*x³+b*x²+(c-d*x)*y²+k; f_y=2y(c-d*x).
  const x=div(p.c,p.d),y=exactRoot(div(add(mul(mul(r(3),p.a),sq(x)),mul(mul(r(2),p.b),x)),p.d));
  locations=[[x,neg(y)],[div(neg(mul(r(2),p.b)),mul(r(3),p.a)),r(0)],[r(0),r(0)],[x,y]];
 }
 const points:W02SourcePoint[]=locations.map(([x,y])=>{
  const xx=three?mul(r(2),p.a):add(mul(mul(r(6),p.a),x),mul(r(2),p.b));
  const xy=neg(mul(mul(r(2),three?p.c:p.d),y));
  const yy=mul(r(2),three?sub(p.b,mul(p.c,x)):sub(p.c,mul(p.d,x)));
  const D=sub(mul(xx,yy),sq(xy));
  const value=add(p.offset,three
   ?add(mul(p.a,sq(x)),mul(sub(p.b,mul(p.c,x)),sq(y)))
   :add(add(mul(p.a,mul(sq(x),x)),mul(p.b,sq(x))),mul(sub(p.c,mul(p.d,x)),sq(y))));
  const kind:W02SourcePoint['kind']=D.numerator<0n?'saddle':D.numerator===0n?'inconclusive':xx.numerator>0n?'minimum':'maximum';
  return {x,y,xx,xy,yy,D,value,kind};
 }).sort((u,v)=>cmpR(u.y,v.y)||cmpR(u.x,v.x));
 if(points.length!==(three?3:4)||points.filter(q=>q.kind==='minimum').length!==1||
  points.filter(q=>q.kind==='saddle').length!==(three?2:3)||
  new Set(points.map(q=>f(q.x)+':'+f(q.y))).size!==points.length)
  throw Error('Stationary list incomplete');
 return points;
}
function presentAdvancedW02(p:W02NonlinearProblem,locale:Locale){
 const lesson=teaching(locale),{t}=lesson,pts=sourceStationaryPoints(p),three=p.mode==='three';
 const expr=three
  ?`(${f(p.a)})x²+((${f(p.b)})−(${f(p.c)})x)y²+(${f(p.offset)})`
  :`(${f(p.a)})x³+(${f(p.b)})x²+((${f(p.c)})−(${f(p.d)})x)y²+(${f(p.offset)})`;
 const fx=three?`2(${f(p.a)})x−(${f(p.c)})y²`:
  `3(${f(p.a)})x²+2(${f(p.b)})x−(${f(p.d)})y²`;
 const fy=three?`2y((${f(p.b)})−(${f(p.c)})x)`:`2y((${f(p.c)})−(${f(p.d)})x)`;
 const label=(k:W02SourcePoint['kind'])=>k==='minimum'?t('minimum lokalne','local minimum'):
  k==='maximum'?t('maksimum lokalne','local maximum'):k==='saddle'?t('punkt siodłowy','saddle point'):t('test nierozstrzygający','inconclusive test');
 const point=(z:W02SourcePoint)=>`(${f(z.x)},${f(z.y)})`;
 lesson.work(`f(x,y)=${expr}; D(f)=ℝ²; f∈C∞(ℝ²)`,
  t('Wszystkie ekstrema lokalne wielomianu leżą wśród punktów stacjonarnych.',
    'All local extrema of this smooth polynomial are among its stationary points.'));
 lesson.work(`f_x=${fx}; f_y=${fy}`,
  t('Oblicz gradient i rozwiąż obydwa równania równocześnie.',
    'Find the gradient and solve both equations simultaneously.'));
 lesson.work(`f_y=0 ⇔ y=0 ${t('lub','or')} ${three?'x=b/c':'x=c/d'}`,
  t('Nie dziel przez y: przypadek y=0 zawiera ważne punkty stacjonarne.',
    'Never divide by y: the y=0 branch contains important stationary points.'));
 lesson.work(three
   ?'y=0 ⇒ x=0; y≠0 ⇒ x=b/c, y²=2ab/c²'
   :t('y=0 ⇒ x=0 lub x=−2b/(3a); y≠0 ⇒ x=c/d, y²=(3ax²+2bx)/d', 'y=0 ⇒ x=0 or x=−2b/(3a); y≠0 ⇒ x=c/d, y²=(3ax²+2bx)/d'),
  t('Zachowaj oba znaki pierwiastka i wszystkie zerowe czynniki.',
    'Keep both square-root signs and every zero-factor branch.'));
 lesson.work(`∇f=0 ⇔ {${pts.map(point).join('; ')}}`,
  t('Dwie gałęzie równania f_y wyczerpują możliwości, więc lista punktów jest kompletna.',
    'The two branches of f_y exhaust all cases, so the list is complete.'));
 lesson.work(three
  ?`f_xx=2(${f(p.a)}); f_xy=f_yx=−2(${f(p.c)})y; f_yy=2((${f(p.b)})−(${f(p.c)})x)`
  :`f_xx=6(${f(p.a)})x+2(${f(p.b)}); f_xy=f_yx=−2(${f(p.d)})y; f_yy=2((${f(p.c)})−(${f(p.d)})x)`,
  t('Oblicz Hessian jako funkcję x,y przed podstawieniem.',
    'Compute the Hessian as a function of x,y before substitution.'));
 const fields:Extract<AnswerSpec,{kind:'multi-choice'}>['fields'][number][]=[];
 for(const [i,z] of pts.entries()){
  const name=['P₁','P₂','P₃','P₄'][i];
  lesson.work(`${name}=${point(z)}; f_xx=${f(z.xx)}; f_xy=${f(z.xy)}; f_yy=${f(z.yy)}; D=${f(z.D)} ⇒ ${label(z.kind)}`,
   t('D=f_xx·f_yy−f_xy²; D<0 oznacza siodło; D>0 i f_xx>0 minimum, a D>0 i f_xx<0 maksimum.',
     'D=f_xx·f_yy−f_xy²; D<0 is a saddle; D>0 with f_xx>0 is a minimum, and D>0 with f_xx<0 is a maximum.'));
  lesson.work(`f${point(z)}=${f(z.value)}; ${name}: ${label(z.kind)}`,
   z.kind==='saddle'
   ?t('Wartość funkcji w siodle nie jest wartością ekstremum lokalnego.',
      'The function value at a saddle is not a local-extremum value.')
   :t('Wartość funkcji w minimum lokalnym jest wartością ekstremum; znak D i f_xx potwierdza typ.',
      'The function value at a local minimum is an extremum value; the signs of D and f_xx confirm its type.'));
  for(const [j,[key,val]] of ([['x',z.x],['y',z.y],['f',z.value],['fxx',z.xx],['D',z.D]] as const).entries()){
   const variants=[val,add(val,r(1)),sub(val,r(1))].map(v=>({value:f(v),label:f(v)})),shift=(i+j)%3;
   fields.push({id:`p${i+1}-${key}`,label:`${name}: ${key}`,value:f(val),
    options:[...variants.slice(shift),...variants.slice(0,shift)]});
  }
  fields.push({id:`p${i+1}-kind`,label:`${name}: K`,value:z.kind,
   options:(['minimum','maximum','saddle','inconclusive'] as const).map(k=>({value:k,label:label(k)}))});
 }
 lesson.work(t(`Wszystkie ${pts.length} punkty: jedno minimum i ${pts.length-1} siodeł.`,
    `All ${pts.length} points: one local minimum and ${pts.length-1} saddles.`),
  t('Poza listą gradient nie znika: nie ma innych ekstremów lokalnych.',
    'Outside the list the gradient is nonzero, so there are no further local extrema.'));
 return lesson.finish(
  t('Wyznacz wszystkie punkty stacjonarne i ekstrema lokalne funkcji ',
    'Find all stationary points and local extrema of ')+`f(x,y)=${expr}. `+
  t('Uporządkuj punkty według y, przy remisie według x. Dla każdego podaj x, y, f, f_xx, D i K (rodzaj punktu).',
    'Order points by y then x. For each give x, y, f, f_xx, D and K (point type).'),
  {kind:'multi-choice',fields},
  t('Rozłóż f_y na czynniki i zacznij od y=0.', 'Factor f_y and start from y=0.'),
  t('Nie pomijaj siodeł; w tym zadaniu są trzy albo cztery punkty stacjonarne.',
    'Do not omit saddles; this task contains three or four stationary points.'));
}
