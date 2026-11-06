"""Independent CAS audit: reconstruct original polynomials, not production answers.
First run w02NonlinearExtrema.test.ts to export authored coefficient records.
"""
import json
import sys
from pathlib import Path
import sympy as s
rows=json.loads(Path(sys.argv[1] if len(sys.argv)>1 else '/tmp/w02-batch3-symbolic-input.json').read_text())
x,y=s.symbols('x y',real=True)
q=lambda value:s.Rational(value.replace('−','-'))
counts={'minimum':0,'maximum':0,'saddle':0,'zero_coordinate_points':0}
for row in rows:
 a,b,c,d,e,o=[q(row['coefficients'][k])for k in ['a','b','c','d','e','offset']]
 F=a*x*x+b*x*y+c*y**3+d*y*y+e*y+o
 grad=[s.diff(F,x),s.diff(F,y)];H=s.hessian(F,(x,y))
 assert s.diff(grad[0],y)==s.diff(grad[1],x)
 solutions=s.solve(grad,(x,y),dict=True)
 assert len(solutions)==2 and all(p[x].is_real and p[y].is_real for p in solutions)
 solutions.sort(key=lambda p:p[y])
 assert len(row['points'])==2
 kinds=[]
 for actual,expected in zip(solutions,row['points']):
  assert actual=={x:q(expected['x']),y:q(expected['y'])}
  assert all(s.simplify(g.subs(actual))==0 for g in grad)
  h=H.subs(actual);D=s.factor(h.det());assert D!=0
  for key,v in [('xx',h[0,0]),('xy',h[0,1]),('yy',h[1,1]),('D',D),('value',F.subs(actual))]:assert s.simplify(v-q(expected[key]))==0
  kind='saddle' if D<0 else 'minimum' if h[0,0]>0 else 'maximum'
  assert kind==expected['kind'];kinds.append(kind);counts[kind]+=1
  if actual[x]==0 or actual[y]==0:counts['zero_coordinate_points']+=1
 assert kinds.count('saddle')==1 and len(kinds)==2
assert len(rows)==24 and counts['minimum']==12 and counts['maximum']==12 and counts['saddle']==24
# Audit the two explicitly authored follow-up proposals, NOT private originals.
# These are symbolic design checks only; no corresponding application family is added.
B,E,O=s.symbols('B E O', real=True);B=s.Symbol('B',real=True,nonzero=True)
J,T=s.symbols('J T',positive=True)
alpha=(B*E+B**2*T**2)/(2*J)
F=(alpha+B*y)*x**2+J*y**2+E*y+O
expected=[{x:0,y:-E/(2*J)},{x:-T,y:-alpha/B},{x:T,y:-alpha/B}]
def check_proposal(F,expected,types,min_value):
 grad=[s.diff(F,x),s.diff(F,y)];H=s.hessian(F,(x,y));solutions=s.solve(grad,(x,y),dict=True)
 assert len(solutions)==len(expected)
 for p,kind in zip(expected,types):
  assert any(all(s.simplify(actual[k]-p[k])==0 for k in [x,y])for actual in solutions)
  assert all(s.simplify(g.subs(p))==0 for g in grad)
  h=H.subs(p);D=s.factor(h.det())
  if kind=='minimum':
   assert D.is_positive and s.factor(h[0,0]).is_positive
   assert s.simplify(F.subs(p)-min_value)==0
  else:assert D.is_negative
check_proposal(F,expected,['minimum','saddle','saddle'],O-E**2/(4*J))
A,R,L,T=s.symbols('A R L T',positive=True)
r0=R;s0=R+L;alpha=-A;delta=3*alpha*r0*s0;beta=-delta/T**2;gamma=-3*alpha*(r0+s0)/2
G=alpha*x**3+beta*x*y**2+gamma*x**2+delta*x+O
check_proposal(G,[{x:r0,y:0},{x:s0,y:0},{x:0,y:-T},{x:0,y:T}],['minimum','saddle','saddle','saddle'],O+alpha*r0**2*(3*s0-r0)/2)
proposals={'three_point':{'status':'PASS','critical_points':3},'four_point':{'status':'PASS','critical_points':4},'source_alignment':'UNVERIFIED authored proposals, no original equation inferred'}
print(json.dumps({'followup_proposals':proposals,'status':'PASS','sympy':s.__version__,'variants':len(rows),'stationary_points':2*len(rows),'counts':counts},indent=2))
