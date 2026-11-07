"""Fresh QA-003 audit from visible questions, with symbolic all-path proofs.
Run after: npx vitest run --config vitest.qa003.config.ts
No production solver, parameter records or answer keys are consumed.
"""
import json,re,sys,hashlib
from pathlib import Path
import sympy as S
src=Path(sys.argv[1]if len(sys.argv)>1 else 'test-results/qa003-multivariable-export.json')
data=json.loads(src.read_text());u,v,t=S.symbols('u v t',real=True)
q=lambda x:S.Rational(x.replace('−','-').strip())
# Uniform bound proof: 4u²v² <= (u²+v²)² everywhere, by a nonnegative square.
assert S.expand((u*u+v*v)**2-4*u*u*v*v-(u*u-v*v)**2)==0
results=[];classes={};numeric_steps=0
for record in data['records']:
 for view in record['views']:
  text=view['question'];angular=re.search(r'g\(x,y\)=\(([^)]+)\)\+\(\(([^)]+)\)u²\+\(([^)]+)\)v²\)\/\(u²\+v²\)',text)
  assigned=re.search(r'; f\([^)]*\)=([^;\n]+)$',text)
  point=q(assigned[1])if assigned else None
  k=None
  if angular:
   b,a,c=map(q,angular.groups());F=b+(a*u*u+c*v*v)/(u*u+v*v)
   first=S.limit(F.subs(v,0),u,0);second=S.limit(F.subs(u,0),v,0)
   if first==second:
    assert S.cancel(F-first)==0;L=first;proof='constant quotient on full punctured domain'
   else:L=None;proof='distinct axis limits'
  else:
   m=re.search(r'g\(x,y\)=\(([^)]+)\)\+\(([^)]+)\)(u²v/\(u⁴\+v²\)|u²v²/\(u²\+v²\)(?:²)?)',text);assert m
   b,k=map(q,m.groups()[:2]);assert k!=0
   expr=m[3]
   if expr=='u²v/(u⁴+v²)':
    F=b+k*u*u*v/(u**4+v*v);first=S.limit(F.subs(v,0),u,0);second=S.limit(F.subs(v,u*u),u,0)
    assert first!=second;L=None;proof='distinct line/parabola limits'
   elif expr.endswith(')²'):
    F=b+k*u*u*v*v/(u*u+v*v)**2;first=S.limit(F.subs(v,0),u,0);second=S.limit(F.subs(v,u),u,0)
    assert first!=second;L=None;proof='distinct axis/diagonal limits'
   else:
    F=b+k*u*u*v*v/(u*u+v*v);L=b;proof='uniform |F-b| <= |k| rho²/4; rho -> 0'
  expected=('finite'if L is not None else 'does-not-exist')if point is None else ('nonremovable'if L is None else 'continuous'if L==point else 'removable')
  actual=view['certificate']['input'];assert actual.get('classification',actual.get('value'))==expected
  if point is None and L is not None:assert q(actual['value'])==L
  # Check displayed numeric path computations from the original visible formula.
  for step in view['steps']:
   if step['kind']!='working':continue
   action=step['action']
   if action.startswith('L₁='):
    prev=view['steps'][3]['action'];m=re.search(r'v=\(([^)]+)\)u²',prev);assert m
    c=q(m[1]);a1=q(re.search(r'L₁=([^;]+)',action)[1]);a2=q(re.search(r'L₂=([^;]+)',action)[1])
    assert a1==S.limit(F.subs(v,0),u,0) and a2==S.limit(F.subs(v,c*u*u),u,0) and a1!=a2;numeric_steps+=1
   m=re.fullmatch(r'v=0: g=([^;]+); v=u≠0: g=(.+)',action)
   if m:assert q(m[1])==S.limit(F.subs(v,0),u,0) and q(m[2])==S.limit(F.subs(v,u),u,0);numeric_steps+=1
   m=re.fullmatch(r'v=0: g=([^;]+); u=0: g=(.+)',action)
   if m:assert q(m[1])==S.limit(F.subs(v,0),u,0) and q(m[2])==S.limit(F.subs(u,0),v,0);numeric_steps+=1
  classes[expected]=classes.get(expected,0)+1
  results.append({'id':f"{record['family_id']}:{record['difficulty']}:{record['variant_index']}",'locale':view['locale'],'result':'PASS','classification':expected,'proof':proof})
assert len(results)==576 and len({r['id']for r in results})==288
out={'main_sha':data['main_sha'],'status':'PASS','sympy':S.__version__,'distinct_tasks':288,'localized_presentations':576,'grading_scenarios':data['grading'],'numeric_path_steps_checked':numeric_steps,'localized_classifications':classes,'export_sha256':hashlib.sha256(src.read_bytes()).hexdigest(),'rows':results}
Path('test-results/qa003-sympy-results.json').write_text(json.dumps(out,indent=2)+'\n')
print(json.dumps({k:v for k,v in out.items()if k!='rows'},indent=2))
