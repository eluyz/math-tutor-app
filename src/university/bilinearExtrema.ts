import {rational as r,addRational as add,subtractRational as sub,multiplyRational as mul,divideRational as div,type Rational} from '../rational';
import {formatRational as f} from '../answers';
import type {UniversityFamily} from './schema';
import type {Locale} from '../locales/types';
import {teaching} from './teaching';
export type BilinearProblem=Readonly<{kind:'multivar-bilinear-extrema';a:Rational;b:Rational;c:Rational;d:Rational}>;
export const bilinearFamilies:readonly UniversityFamily[]=[{id:'multivar-bilinear-extrema',category:'derivatives',titles:{pl:'Funkcja dwuliniowa: punkt siodłowy i brak ekstremów',en:'Bilinear function: saddle point and no extrema'},supportedDifficulties:['hard'],create:v=>({kind:'multivar-bilinear-extrema',a:r((v%2?-1:1)*(1+v%4),2),b:r(v%7-3,2),c:r(Math.floor(v/4)-2,3),d:r(v-11,2)})}];
export function presentBilinear(p:BilinearProblem,locale:Locale){
 const lesson=teaching(locale),{t}=lesson;
 const x=div(sub(r(0),p.c),p.a),y=div(sub(r(0),p.b),p.a),D=sub(r(0),mul(p.a,p.a)),value=sub(p.d,div(mul(p.b,p.c),p.a));
 const expression=`(${f(p.a)})xy+(${f(p.b)})x+(${f(p.c)})y+(${f(p.d)})`;
 lesson.work(`f(x,y)=${expression}; D(f)=ℝ²`,t('Jest to wielomian gładki na całej płaszczyźnie.','This polynomial is smooth on the whole plane.'));
 lesson.work(`f_x=(${f(p.a)})y+(${f(p.b)}); f_y=(${f(p.a)})x+(${f(p.c)})`,t('Traktuj drugą zmienną jako stałą w każdej pochodnej.','Hold the other variable constant in each partial derivative.'));
 lesson.work(`f_x=f_y=0 ⇒ x=${f(x)}, y=${f(y)}`,t('Ponieważ a≠0, każde równanie liniowe wyznacza jedną współrzędną. Jest to jedyny punkt stacjonarny.','Since a≠0, each linear equation fixes one coordinate. This is the only stationary point.'));
 lesson.work(`H=[[0,${f(p.a)}],[${f(p.a)},0]]; D=−a²=${f(D)}<0`,t('Ujemny wyznacznik oznacza nieokreśloną formę kwadratową i punkt siodłowy, nie minimum ani maksimum.','The negative determinant gives an indefinite quadratic form and a saddle, not a minimum or maximum.'));
 lesson.work(`f(${f(x)},${f(y)})=${f(value)}; f−f_* = (${f(p.a)})(x−(${f(x)}))(y−(${f(y)}))`,t('Po przesunięciu punktu funkcja przyjmuje wartości obu znaków względem f_* na kierunkach u=v oraz u=−v.','After translation, the change from f_* has opposite signs along u=v and u=−v.'));
 lesson.work(t('Punkt siodłowy; brak ekstremów lokalnych.','Saddle point; no local extrema.'),t('Każde ekstremum lokalne gładkiej funkcji na ℝ² musi być stacjonarne. Jedyny taki punkt jest siodłem. D=0 byłoby testem nierozstrzygającym, lecz tutaj D<0.','Every local extremum of a smooth function on ℝ² must be stationary. The only such point is a saddle. D=0 would be inconclusive, but here D<0.'));
 const numbers=[['x_*',x],['y_*',y],['f_*',value],['D',D]] as const;
 const fields:{id:string;label:string;value:string;options:{value:string;label:string}[]}[]=numbers.map(([id,n])=>{const labels=[...new Set([f(n),f(add(n,r(1))),f(sub(n,r(1)))])];return {id,label:id,value:id+':0',options:labels.map((label,i)=>({label,value:id+':'+i}))};});
 fields.push({id:'conclusion',label:t('Wniosek','Conclusion'),value:'saddle-none',options:[{value:'saddle-none',label:t('Punkt siodłowy; brak ekstremów lokalnych','Saddle point; no local extrema')},{value:'minimum',label:t('Minimum lokalne','Local minimum')},{value:'maximum',label:t('Maksimum lokalne','Local maximum')},{value:'inconclusive',label:t('Test nierozstrzygający','Inconclusive test')}]});
 return lesson.finish(t('Wyznacz wszystkie punkty stacjonarne, zbadaj Hessian i określ ekstrema lokalne. Wpisz wartość funkcji w punkcie, nie wartość nieistniejącego ekstremum.','Find all stationary points, examine the Hessian and determine local extrema. Enter the function value at the point, not a nonexistent extremum value.')+`\nf(x,y)=${expression}`,{kind:'multi-choice',fields},t('Rozwiąż oba równania gradientu; nie utożsamiaj stacjonarności z ekstremum.','Solve both gradient equations; stationarity does not imply an extremum.'),t('Oblicz D=−a² i odróżnij D<0 od D=0.','Compute D=−a² and distinguish D<0 from D=0.'));
}
