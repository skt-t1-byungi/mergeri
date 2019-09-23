export = mergeri

declare function mergeri<T extends obj, S1 extends obj>(
    matchers:Matchers, t:T, s:S1
) : M<T,S1>
declare function mergeri<T extends obj, S1 extends obj, S2 extends obj>(
    matchers:Matchers, t:T, s1:S1, s2:S2
) : M<M<T,S1>,S2>
declare function mergeri<T extends obj, S1 extends obj, S2 extends obj, S3 extends obj>(
    matchers:Matchers, t:T, s1:S1, s2:S2, s3:S3
) : M<M<M<T,S1>,S2>,S3>
declare function mergeri<T extends obj, S1 extends obj, S2 extends obj, S3 extends obj, S4 extends obj>(
    matchers:Matchers, t:T, s1:S1, s2:S2, s3:S3, s4:S4
) : M<M<M<M<T,S1>,S2>,S3>,S4>
declare function mergeri<T extends obj, S1 extends obj, S2 extends obj, S3 extends obj, S4 extends obj, S5 extends obj>(
    matchers:Matchers, t:T, s1:S1, s2:S2, s3:S3, s4:S4, s5: S5
) : M<M<M<M<M<T,S1>,S2>,S3>,S4>,S5>


type obj = object
type Matcher = string | string[] | CustomMatcher
type Matchers = {[path:string]:Matcher}
type CustomMatcher = (targetKey: string, srcKey: string, targetValue: any, srcValue: any, targetObj: any, srcObj: any) => boolean
type MergeProp<P1,P2> = P1 extends object ? (P2 extends object ? M<P1,P2>:P2) : P2
type Inner<T extends object, U extends object> = Pick<T,Extract<keyof T, keyof U> & Extract<keyof U, keyof T>>
type Diff<T,U> = Pick<T,Exclude<keyof T, keyof U>>
type M<T extends object, S extends object> = Diff<T,S> & Diff<S,T> & {[P in keyof Inner<T,S>]: MergeProp<T[P],S[P]>}
